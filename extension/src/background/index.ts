// Service worker: sign-in, token storage, every network call to the Escapture
// app (it has host permission, so no CORS issue), image fetching, hashing, upload.
import {
  captureHost,
  FIT_WIDTHS,
  gzip,
  MAX_BYTES,
  MAX_UPLOAD_BYTES,
  type AuthState,
  HISTORY_SIZE,
  type CaptureRecord,
  type LastCapture,
  type Message,
  type Reply,
} from "../shared/types";

const APP_URL = __APP_URL__;

type Stored = {
  token?: string;
  name?: string;
  email?: string;
  boundEmail?: string;
  lastCapture?: LastCapture;
  history?: CaptureRecord[];
  unlockedTabs?: Record<string, number>;
};

const sessionStore = chrome.storage.session ?? chrome.storage.local;

const store = {
  get: () =>
    chrome.storage.local.get(["token", "name", "email", "boundEmail", "lastCapture", "history"]) as Promise<Stored>,
  set: (v: Partial<Stored>) => chrome.storage.local.set(v),
  clearAuth: async () => {
    // boundEmail is intentionally preserved across sign-out to keep 1-to-1 browser linking.
    await chrome.storage.local.remove(["token", "name", "email", "lastCapture", "history"]);
    await sessionStore.remove(["unlockedTabs"]).catch(() => {});
  },
};

async function getUnlockedTabs(): Promise<Record<string, number>> {
  const data = (await sessionStore.get(["unlockedTabs"]).catch(() => ({}))) as {
    unlockedTabs?: Record<string, number>;
  };
  return data.unlockedTabs ?? {};
}

async function getTabUnlock(tabId: number): Promise<number | null> {
  const map = await getUnlockedTabs();
  const key = String(tabId);
  const exp = map[key];
  if (!exp) return null;
  if (exp <= Date.now()) {
    delete map[key];
    await sessionStore.set({ unlockedTabs: map }).catch(() => {});
    return null;
  }
  return exp;
}

async function setTabUnlock(tabId: number, expiresAtMs: number): Promise<void> {
  const map = await getUnlockedTabs();
  map[String(tabId)] = expiresAtMs;
  await sessionStore.set({ unlockedTabs: map }).catch(() => {});
}

async function clearTabUnlock(tabId?: number): Promise<void> {
  if (tabId === undefined) {
    await sessionStore.remove(["unlockedTabs"]).catch(() => {});
    return;
  }
  const map = await getUnlockedTabs();
  const key = String(tabId);
  if (key in map) {
    delete map[key];
    await sessionStore.set({ unlockedTabs: map }).catch(() => {});
  }
}

// Per-tab unlock lifecycle: closing a tab or leaving Facebook relocks it.
chrome.tabs.onRemoved.addListener((tabId) => {
  void clearTabUnlock(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const nextUrl = changeInfo.url ?? tab.url;
  if (nextUrl && !captureHost(nextUrl)) {
    void clearTabUnlock(tabId);
  }
});

async function appFetch(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // Never send the browser's Escapture cookies: the extension has its own session.
  return fetch(`${APP_URL}${path}`, { ...init, headers, credentials: "omit" });
}

const errorText = async (res: Response, fallback: string) => {
  const body = await res.json().catch(() => null);
  return (body?.error?.message ?? body?.message ?? fallback) as string;
};

async function authStatus(): Promise<AuthState> {
  const { token, name, email } = await store.get();
  if (!token) return { signedIn: false };
  try {
    const res = await appFetch("/api/auth/get-session", {}, token);
    const session = res.ok ? await res.json().catch(() => null) : null;
    if (res.ok && !session?.user) {
      await store.clearAuth();
      return { signedIn: false };
    }
    if (session?.user) return { signedIn: true, name: session.user.name, email: session.user.email };
  } catch {
    // Offline: keep the stored session and let the upload report the problem.
  }
  return { signedIn: true, name: name ?? "", email: email ?? "" };
}

async function signIn(email: string, password: string): Promise<Reply<{ auth: AuthState }>> {
  const normalizedEmail = email.trim().toLowerCase();
  const { boundEmail } = await store.get();
  if (boundEmail && boundEmail !== normalizedEmail) {
    return {
      ok: false,
      error: `This browser extension is linked to ${boundEmail}. Ask an administrator to reset the device link before signing in with a different account.`,
    };
  }

  let res: Response;
  try {
    res = await appFetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { ok: false, error: "We couldn't reach Escapture. Check your connection and try again." };
  }
  if (!res.ok) {
    return {
      ok: false,
      error:
        res.status === 401
          ? "That email or password isn't right. Check them and try again."
          : await errorText(res, "We couldn't sign you in. Please try again."),
    };
  }
  const token = res.headers.get("set-auth-token");
  const body = await res.json().catch(() => null);
  if (!token || !body?.user) return { ok: false, error: "We couldn't sign you in. Please try again." };
  await clearTabUnlock();
  const userEmail = String(body.user.email ?? email).trim().toLowerCase();
  await store.set({
    token,
    name: body.user.name,
    email: body.user.email,
    boundEmail: boundEmail ?? userEmail,
  });
  return { ok: true, auth: { signedIn: true, name: body.user.name, email: body.user.email } };
}

async function signOut() {
  const { token } = await store.get();
  if (token) await appFetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, token).catch(() => {});
  await store.clearAuth();
}

async function injectAndStartPicker(tabId: number): Promise<Reply> {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    await chrome.tabs.sendMessage(tabId, { type: "picker:start" });
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't start on this page. Reload it and try again." };
  }
}

type GrantRequestReply =
  | { status: "granted"; expiresAt: string }
  | { status: "needs_enrollment"; reason: string; enrollUrl: string }
  | { status: "pending"; requestId: string; verifyUrl: string };

async function waitForGrant(
  requestId: string,
  targetTabId: number,
  verifyWinId: number | undefined,
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  for (let attempt = 0; attempt < 90; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const res = await appFetch(
        `/api/capture-grant/status?req=${encodeURIComponent(requestId)}`,
        {},
        token,
      );
      if (!res.ok) {
        if (res.status === 404) return { ok: false, error: "Verification request expired." };
        continue;
      }
      const data = (await res.json()) as {
        status?: "granted" | "pending" | "expired";
        expiresAt?: string;
      };
      if (data.status === "granted" && data.expiresAt) {
        await setTabUnlock(targetTabId, new Date(data.expiresAt).getTime());
        if (verifyWinId !== undefined) {
          await chrome.windows.remove(verifyWinId).catch(() => {});
        }
        await chrome.tabs.update(targetTabId, { active: true }).catch(() => {});
        const targetTab = await chrome.tabs.get(targetTabId).catch(() => null);
        if (targetTab?.windowId !== undefined) {
          await chrome.windows.update(targetTab.windowId, { focused: true }).catch(() => {});
        }
        return { ok: true };
      }
      if (data.status === "expired") {
        if (verifyWinId !== undefined) {
          await chrome.windows.remove(verifyWinId).catch(() => {});
        }
        return { ok: false, error: "Verification timed out. Try again when ready." };
      }
    } catch {
      // Transient network hiccup
    }
  }
  return { ok: false, error: "Verification timed out. Try again when ready." };
}

async function ensureTabCaptureGrant(
  tabId: number,
  token: string,
  forceVerify = false,
  awaitGrant = true,
): Promise<{ ok: boolean; error?: string; passkeyRequired?: boolean; needsEnrollment?: boolean }> {
  const unlockedUntil = await getTabUnlock(tabId);
  if (!forceVerify && unlockedUntil && unlockedUntil > Date.now()) {
    return { ok: true };
  }

  let grantRes: Response;
  try {
    grantRes = await appFetch(
      "/api/capture-grant/request",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceVerify: true }),
      },
      token,
    );
  } catch {
    return {
      ok: false,
      error: "We couldn't reach Escapture. Check your connection and try again.",
    };
  }

  if (grantRes.status === 401) {
    await store.clearAuth();
    return { ok: false, error: "Your Escapture session ended. Sign in again." };
  }
  if (!grantRes.ok) {
    return {
      ok: false,
      error: await errorText(grantRes, "We couldn't verify your capture permission. Please try again."),
    };
  }

  const grant = (await grantRes.json()) as GrantRequestReply;

  if (grant.status === "needs_enrollment") {
    if (grant.reason === "no_passkey") {
      await chrome.storage.local.remove(["boundEmail"]).catch(() => {});
    }
    await chrome.tabs.create({
      url: grant.enrollUrl || `${APP_URL}/account/security`,
      active: true,
    });
    return {
      ok: false,
      error: "Link your device passkey on the Escapture Security page before capturing evidence.",
      needsEnrollment: true,
      passkeyRequired: true,
    };
  }

  if (grant.status === "granted") {
    await setTabUnlock(tabId, new Date(grant.expiresAt).getTime());
    return { ok: true };
  }

  // status === "pending": notify the tab, open the verification window, and poll until approved.
  await chrome.tabs.sendMessage(tabId, {
    type: "capture:status",
    status: "verifying",
    message: "Confirm with your passkey in the opened window to save this capture...",
  }).catch(() => {});

  const popupWidth = 460;
  const popupHeight = 620;
  const currentWin = await chrome.windows.getCurrent().catch(() => null);
  const left = currentWin?.left !== undefined && currentWin?.width !== undefined
    ? Math.round(currentWin.left + (currentWin.width - popupWidth) / 2)
    : undefined;
  const top = currentWin?.top !== undefined && currentWin?.height !== undefined
    ? Math.round(currentWin.top + (currentWin.height - popupHeight) / 2)
    : undefined;

  const verifyWin = await chrome.windows.create({
    url: grant.verifyUrl,
    type: "popup",
    width: popupWidth,
    height: popupHeight,
    left,
    top,
    focused: true,
  });

  if (awaitGrant) {
    const waitResult = await waitForGrant(grant.requestId, tabId, verifyWin?.id, token);
    if (!waitResult.ok) {
      return {
        ok: false,
        error: waitResult.error ?? "Passkey verification was cancelled or timed out.",
        passkeyRequired: true,
      };
    }
  } else {
    void waitForGrant(grant.requestId, tabId, verifyWin?.id, token).then((res) => {
      if (res.ok) {
        void injectAndStartPicker(tabId);
      }
    });
  }

  return { ok: true };
}

async function startCapture(): Promise<Reply> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !captureHost(tab.url)) {
    return {
      ok: false,
      error: "Open the Facebook post or Messenger conversation you want to keep, then try again.",
    };
  }
  const { token } = await store.get();
  if (!token) return { ok: false, error: "Sign in to Escapture first." };

  const unlockedUntil = await getTabUnlock(tab.id);
  if (unlockedUntil && unlockedUntil > Date.now()) {
    return injectAndStartPicker(tab.id);
  }

  const grantResult = await ensureTabCaptureGrant(tab.id, token, true, false);
  if (!grantResult.ok) {
    return { ok: false, error: grantResult.error ?? "Verification failed." };
  }

  return { ok: true };
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/**
 * Fetches an image and returns a data URI.
 * With `maxWidth`, the image is embedded no wider than that (photos and
 * avatars are embedded at the size they are shown, not the size Facebook
 * serves) and animated images are reduced to their first frame. Without it
 * the file is passed through untouched, which CSS sprite sheets need.
 */
async function fetchImage(url: string, maxWidth?: number, quality = 0.8): Promise<Reply<{ dataUrl: string }>> {
  try {
    const res = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    let blob = await res.blob();
    if (!blob.type.startsWith("image/")) return { ok: false, error: "not an image" };
    if (maxWidth && !blob.type.startsWith("image/svg")) {
      const bitmap = await createImageBitmap(blob);
      const small = bitmap.width <= maxWidth && blob.size <= 30 * 1024 && blob.type !== "image/gif";
      if (!small) {
        const scale = Math.min(1, maxWidth / bitmap.width);
        const canvas = new OffscreenCanvas(
          Math.max(1, Math.round(bitmap.width * scale)),
          Math.max(1, Math.round(bitmap.height * scale)),
        );
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        // WebP keeps transparency (stickers, icons) and is smaller than JPEG.
        blob = await canvas.convertToBlob({ type: "image/webp", quality });
      }
      bitmap.close();
    }
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { ok: true, dataUrl: `data:${blob.type};base64,${toBase64(bytes)}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch failed" };
  }
}

/** Text of a style sheet the page itself was not allowed to read (cross-origin, no CORS headers). */
async function fetchSheet(url: string): Promise<Reply<{ text: string }>> {
  try {
    if (!/^https?:/.test(url)) return { ok: false, error: "unsupported URL" };
    const res = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const text = await res.text();
    if (text.length > 8 * 1024 * 1024) return { ok: false, error: "too large" };
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch failed" };
  }
}

/**
 * How tall the finished capture is at the viewer's widths, measured in an offscreen
 * document (a service worker has no layout). Best effort: without it the viewer estimates.
 */
async function measureCapture(html: string): Promise<Reply<{ fit: { w: number; h: number }[] }>> {
  try {
    if (!(await chrome.offscreen.hasDocument())) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: [chrome.offscreen.Reason.DOM_PARSER],
        justification: "Measure how tall a finished capture is, so the Escapture viewer can size itself to it.",
      });
    }
    const reply = (await Promise.race([
      chrome.runtime.sendMessage({ target: "offscreen", type: "measure", html, widths: FIT_WIDTHS }),
      new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
    ])) as { ok?: boolean; fit?: { w: number; h: number }[] } | null;
    return reply?.ok && reply.fit?.length ? { ok: true, fit: reply.fit } : { ok: false, error: "not measured" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "not measured" };
  }
}

async function upload(
  msg: Extract<Message, { type: "capture:upload" }>,
  senderTabId?: number,
): Promise<Reply<{ result: LastCapture }>> {
  const at = new Date().toISOString();
  const fail = async (message: string, refused = false, passkeyRequired = false) => {
    const result: LastCapture = { ok: false, refused, message, at, passkeyRequired };
    await store.set({ lastCapture: result });
    return { ok: true as const, result };
  };

  const { token } = await store.get();
  if (!token) return fail("Sign in to Escapture in the extension, then capture again.");

  // If the sender tab is known and not unlocked, auto-prompt passkey verification before sending
  if (senderTabId !== undefined) {
    const unlockCheck = await getTabUnlock(senderTabId);
    if (!unlockCheck || unlockCheck <= Date.now()) {
      const grantRes = await ensureTabCaptureGrant(senderTabId, token, true);
      if (!grantRes.ok) {
        return fail(grantRes.error ?? "Passkey verification required.", false, grantRes.passkeyRequired ?? true);
      }
    }
  }

  // The hash is of the exact bytes the server will store: the HTML itself.
  const bytes = new TextEncoder().encode(msg.html);
  if (bytes.byteLength > MAX_BYTES) return fail("This capture is too large. Select a smaller area.", true);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const sha256 = [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
  // It travels gzip-compressed; the server unpacks it and checks the hash.
  const packed = await gzip(bytes);
  if (packed.byteLength > MAX_UPLOAD_BYTES) return fail("This capture is too large. Select a smaller area.", true);

  const makeForm = () => {
    const form = new FormData();
    form.set("file", new File([packed as BlobPart], "capture.html.gz", { type: "application/gzip" }));
    form.set("encoding", "gzip");
    form.set("sha256", sha256);
    form.set("kind", msg.kind);
    form.set("sourceUrl", msg.sourceUrl);
    form.set("clientCapturedAt", msg.clientCapturedAt);
    form.set("tamperReport", JSON.stringify({ ...msg.tamperReport, extensionVersion: __EXT_VERSION__ }));
    form.set("extensionVersion", __EXT_VERSION__);
    return form;
  };

  let res: Response;
  try {
    res = await appFetch("/api/evidence", { method: "POST", body: makeForm() }, token);
  } catch {
    return fail("We couldn't reach Escapture, so nothing was saved. Check your connection and capture again.");
  }
  if (res.status === 401) {
    await store.clearAuth();
    return fail("Your Escapture session ended. Sign in again in the extension, then capture again.");
  }
  if (res.status === 403) {
    const errBody = await res.json().catch(() => null);
    if (errBody?.error?.code === "passkey_required") {
      await clearTabUnlock(senderTabId);
      if (senderTabId !== undefined) {
        const retryGrant = await ensureTabCaptureGrant(senderTabId, token, true);
        if (retryGrant.ok) {
          try {
            const retryRes = await appFetch("/api/evidence", { method: "POST", body: makeForm() }, token);
            if (retryRes.ok) {
              const saved = await retryRes.json();
              const result: LastCapture = { ok: true, id: saved.id, label: saved.label, url: `${APP_URL}/vault/${saved.id}`, at };
              const history = [{ id: saved.id, label: saved.label, url: result.url, at }, ...((await store.get()).history ?? [])];
              await store.set({ lastCapture: result, history: history.slice(0, HISTORY_SIZE) });
              return { ok: true, result };
            }
          } catch {
            return fail("We couldn't reach Escapture after verification. Please try again.");
          }
        } else {
          return fail(retryGrant.error ?? "Passkey verification required.", false, true);
        }
      }
      return fail(
        "Verify with your passkey before capturing evidence.",
        false,
        true,
      );
    }
    return fail(errBody?.error?.message ?? "You don't have permission to save this capture.");
  }
  if (!res.ok) return fail(await errorText(res, "We couldn't save this capture. Please try again."));
  const saved = await res.json();
  const result: LastCapture = { ok: true, id: saved.id, label: saved.label, url: `${APP_URL}/vault/${saved.id}`, at };
  const history = [{ id: saved.id, label: saved.label, url: result.url, at }, ...((await store.get()).history ?? [])];
  await store.set({ lastCapture: result, history: history.slice(0, HISTORY_SIZE) });
  return { ok: true, result };
}

async function handle(msg: Message, sender: chrome.runtime.MessageSender): Promise<unknown> {
  switch (msg.type) {
    case "auth:status": {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabUnlockedUntil = tab?.id ? await getTabUnlock(tab.id) : null;
      const saved = await store.get();
      return {
        ok: true,
        auth: await authStatus(),
        lastCapture: saved.lastCapture ?? null,
        history: saved.history ?? [],
        boundEmail: saved.boundEmail ?? null,
        tabUnlockedUntil,
      };
    }
    case "auth:signIn":
      return signIn(msg.email, msg.password);
    case "auth:signOut":
      await signOut();
      return { ok: true };
    case "capture:start":
      return startCapture();
    case "capture:result":
      await store.set({ lastCapture: msg.result });
      return { ok: true };
    case "image:fetch":
      return fetchImage(msg.url, msg.maxWidth, msg.quality);
    case "sheet:fetch":
      return fetchSheet(msg.url);
    case "capture:measure":
      return measureCapture(msg.html);
    case "capture:upload":
      return upload(msg, sender.tab?.id);
  }
}

chrome.runtime.onMessage.addListener((msg: Message, sender, sendResponse) => {
  // Only this extension's own pages and content scripts may talk to the worker.
  if (sender.id !== chrome.runtime.id) return false;
  handle(msg, sender).then(sendResponse, (e) =>
    sendResponse({ ok: false, error: e instanceof Error ? e.message : "Something went wrong." }),
  );
  return true;
});
