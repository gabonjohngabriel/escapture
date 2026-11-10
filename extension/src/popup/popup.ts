import {
    captureHost,
    type AuthState,
    type CaptureRecord,
    type LastCapture,
    type Reply,
} from "../shared/types";

type Status = {
    auth: AuthState;
    lastCapture: LastCapture | null;
    history: CaptureRecord[];
    boundEmail?: string | null;
    tabUnlockedUntil?: number | null;
};

const send = <T>(msg: unknown) =>
    chrome.runtime.sendMessage(msg) as Promise<Reply<T>>;

// DOM element references
const viewError = document.getElementById("view-error") as HTMLParagraphElement;
const viewLoading = document.getElementById("view-loading") as HTMLDivElement;
const viewSignedOut = document.getElementById(
    "view-signed-out",
) as HTMLDivElement;
const boundNotice = document.getElementById(
    "bound-notice",
) as HTMLParagraphElement;
const viewReady = document.getElementById("view-ready") as HTMLDivElement;

const formSignin = document.getElementById("form-signin") as HTMLFormElement;
const inputEmail = document.getElementById("input-email") as HTMLInputElement;
const inputPassword = document.getElementById(
    "input-password",
) as HTMLInputElement;
const btnSigninSubmit = document.getElementById(
    "btn-signin-submit",
) as HTMLButtonElement;
const linkSignup = document.getElementById("link-signup") as HTMLAnchorElement;

const userGreeting = document.getElementById(
    "user-greeting",
) as HTMLParagraphElement;
const captureHeading = document.getElementById(
    "capture-heading",
) as HTMLHeadingElement;
const btnCapture = document.getElementById("btn-capture") as HTMLButtonElement;
const btnSignout = document.getElementById("btn-signout") as HTMLButtonElement;

// Set signup link dynamically from build environment
if (linkSignup) {
    linkSignup.href = `${__APP_URL__}/sign-up`;
}

function showError(message?: string) {
    if (message) {
        viewError.textContent = message;
        viewError.hidden = false;
    } else {
        viewError.textContent = "";
        viewError.hidden = true;
    }
}

function showView(view: "loading" | "signed-out" | "ready") {
    viewLoading.hidden = view !== "loading";
    viewSignedOut.hidden = view !== "signed-out";
    viewReady.hidden = view !== "ready";
}

function setupSignedOutView(error?: string, boundEmail?: string | null) {
    showView("signed-out");
    showError(error);
    if (boundEmail !== undefined) {
        if (boundEmail) {
            boundNotice.textContent = `This extension is linked to ${boundEmail}.`;
            boundNotice.hidden = false;
            if (!inputEmail.value) inputEmail.value = boundEmail;
        } else {
            boundNotice.textContent = "";
            boundNotice.hidden = true;
        }
    }
    btnSigninSubmit.disabled = false;
    btnSigninSubmit.textContent = "Sign in to Escapture";
}

formSignin.addEventListener("submit", async (e) => {
    e.preventDefault();
    btnSigninSubmit.disabled = true;
    btnSigninSubmit.textContent = "Signing in...";
    showError(undefined);

    const reply = await send<{ auth: AuthState }>({
        type: "auth:signIn",
        email: inputEmail.value.trim(),
        password: inputPassword.value,
    });

    if (reply.ok) {
        inputPassword.value = "";
        void render();
    } else {
        setupSignedOutView(reply.error);
    }
});

btnSignout.addEventListener("click", async () => {
    await send({ type: "auth:signOut" });
    void render();
});

btnCapture.addEventListener("click", async () => {
    const previousText = btnCapture.textContent;
    btnCapture.disabled = true;
    btnCapture.textContent = "Verifying with passkey...";
    showError(undefined);
    const reply = await send({ type: "capture:start" });
    if (reply.ok) {
        window.close();
    } else {
        showError(reply.error);
        btnCapture.textContent = previousText || "Capture this page";
        btnCapture.disabled = false;
    }
});

async function setupReadyView(
    auth: Extract<AuthState, { signedIn: true }>,
    tabUnlockedUntil?: number | null,
    error?: string,
) {
    showView("ready");
    showError(error);

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    const supported = Boolean(tab?.url && captureHost(tab.url));

    // Greeting
    const firstName = auth.name?.trim() ? auth.name.split(" ")[0] : "User";
    const minsLeft =
        tabUnlockedUntil && tabUnlockedUntil > Date.now()
            ? Math.max(1, Math.ceil((tabUnlockedUntil - Date.now()) / 60_000))
            : null;
    userGreeting.textContent = minsLeft
        ? `Hello, ${firstName}! · Unlocked (${minsLeft}m left)`
        : `Hello, ${firstName}!`;

    // Dynamic heading & capture button state based on current page
    if (supported) {
        captureHeading.className = "heading-default";
        captureHeading.textContent = "Capture evidence?";
        btnCapture.className = "btn-capture active";
        btnCapture.textContent = minsLeft
            ? "Capture this page"
            : "Verify & capture this page";
        btnCapture.disabled = false;
    } else {
        captureHeading.className = "heading-unable";
        captureHeading.textContent =
            "Open Facebook posts, stories, or conversations you want to keep, then open this again.";
        btnCapture.className = "btn-capture disabled";
        btnCapture.textContent = "Capture this page";
        btnCapture.disabled = true;
    }
}

async function render() {
    const reply = await send<Status>({ type: "auth:status" }).catch(
        (): Reply<Status> => ({
            ok: false,
            error: "The extension couldn't start. Close this and open it again.",
        }),
    );

    if (!reply.ok) {
        showView("loading");
        showError(reply.error);
        return;
    }

    if (!reply.auth.signedIn) {
        setupSignedOutView(undefined, reply.boundEmail);
    } else {
        await setupReadyView(reply.auth, reply.tabUnlockedUntil);
    }
}

void render();
