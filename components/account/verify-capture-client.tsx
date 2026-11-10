"use client";

import {
    browserSupportsWebAuthn,
    startAuthentication,
    type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import {
    AlertTriangle,
    CheckCircle2,
    KeyRound,
    ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { Banner } from "@/components/ui/feedback";
import { api, errorMessage } from "@/lib/client-api";

type VerifyState =
    | "ready"
    | "not_found"
    | "account_mismatch"
    | "device_mismatch"
    | "sign_in_required"
    | "already_verified"
    | "expired"
    | "needs_enrollment";

export function VerifyCaptureClient({
    initialState,
    requestId,
    userEmail,
    userName,
}: {
    initialState: VerifyState;
    requestId: string;
    userEmail: string;
    userName?: string;
}) {
    const [state, setState] = useState<VerifyState | "verified">(initialState);
    const [currentReqId, setCurrentReqId] = useState(requestId);
    const [email, setEmail] = useState(userEmail);
    const [name, setName] = useState(userName);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = useCallback(
        async (idToCheck?: string) => {
            const search =
                typeof window !== "undefined"
                    ? new URLSearchParams(window.location.search)
                    : null;
            const targetId = (
                idToCheck ||
                search?.get("req") ||
                currentReqId ||
                ""
            ).trim();
            if (!targetId) return;
            try {
                const res = await api<{
                    state: VerifyState;
                    requestId?: string;
                    userEmail?: string;
                    userName?: string;
                }>(
                    `/api/passkeys/auth/info?req=${encodeURIComponent(targetId)}`,
                );
                if (res.state) {
                    setState(res.state);
                    if (res.requestId) setCurrentReqId(res.requestId);
                    if (res.userEmail) setEmail(res.userEmail);
                    if (res.userName) setName(res.userName);
                }
            } catch {
                // Keep existing state on error
            }
        },
        [currentReqId],
    );

    useEffect(() => {
        let active = true;
        const search =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : null;
        const targetId = (search?.get("req") || requestId || "").trim();
        if (
            targetId &&
            (initialState === "not_found" || initialState === "expired")
        ) {
            api<{
                state: VerifyState;
                requestId?: string;
                userEmail?: string;
                userName?: string;
            }>(`/api/passkeys/auth/info?req=${encodeURIComponent(targetId)}`)
                .then((res) => {
                    if (active && res.state) {
                        setState(res.state);
                        if (res.requestId) setCurrentReqId(res.requestId);
                        if (res.userEmail) setEmail(res.userEmail);
                        if (res.userName) setName(res.userName);
                    }
                })
                .catch(() => {});
        }
        return () => {
            active = false;
        };
    }, [initialState, requestId]);

    async function handleVerify() {
        setError(null);
        if (!browserSupportsWebAuthn()) {
            setError("This browser does not support passkeys (WebAuthn).");
            return;
        }

        setBusy(true);
        try {
            const { options } = await api<{
                options: PublicKeyCredentialRequestOptionsJSON;
            }>("/api/passkeys/auth/options", {
                body: { requestId: currentReqId },
            });

            const asseResp = await startAuthentication({
                optionsJSON: options,
            });

            await api("/api/passkeys/auth/verify", {
                body: {
                    requestId: currentReqId,
                    response: asseResp,
                },
            });

            setState("verified");
            setTimeout(() => {
                try {
                    window.close();
                } catch {}
            }, 1200);
        } catch (err) {
            if (err instanceof Error && err.name === "NotAllowedError") {
                setError(
                    "Verification was cancelled or timed out. Click the button below to try again.",
                );
            } else {
                setError(errorMessage(err));
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mx-auto my-8 max-w-lg">
            <div className="overflow-hidden rounded-2xl border-2 border-brand-500 bg-card shadow-md">
                <div className="flex items-center gap-3.5 bg-brand-500 px-6 py-5 text-white">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/10">
                        <KeyRound size={22} strokeWidth={2} aria-hidden />
                    </div>
                    <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                            Security
                        </span>
                        <h1 className="text-xl font-bold text-white leading-snug">
                            Confirm it&apos;s you to capture
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col gap-5 p-6">
                    {state === "verified" || state === "already_verified" ? (
                        <div className="flex flex-col items-center py-4 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                                <CheckCircle2
                                    size={30}
                                    strokeWidth={2.25}
                                    aria-hidden
                                />
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-brand-800">
                                You&apos;re now verified
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted">
                                Evidence capturing is now unlocked for your
                                Facebook tab. Returning to your tab…
                            </p>
                            <button
                                type="button"
                                onClick={() => window.close()}
                                className="mt-5 h-10 rounded-full border border-brand-500 bg-brand-50 px-5 text-sm font-semibold text-brand-800 hover:bg-brand-100 cursor-pointer">
                                Close this window
                            </button>
                        </div>
                    ) : state === "sign_in_required" ? (
                        <div className="flex flex-col gap-4">
                            <Banner tone="attention">
                                Sign in to your Escapture student account in this browser window before verifying your capture.
                            </Banner>
                            <div>
                                <Link
                                    href="/sign-in"
                                    className={buttonClass("primary")}>
                                    Sign in to Escapture
                                </Link>
                            </div>
                        </div>
                    ) : state === "device_mismatch" ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                                <ShieldAlert
                                    size={20}
                                    className="mt-0.5 shrink-0 text-amber-700"
                                    aria-hidden
                                />
                                <div className="text-sm leading-relaxed">
                                    <p className="font-bold">
                                        Unlinked browser or device
                                    </p>
                                    <p className="mt-1">
                                        This browser is not the linked laptop for{" "}
                                        <span className="font-semibold">
                                            {userEmail}
                                        </span>
                                        . Capturing evidence is only allowed from your linked browser.
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted">
                                If you changed laptops or cleared your browser, ask an administrator to reset your passkey and device link.
                            </p>
                        </div>
                    ) : state === "account_mismatch" ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                                <ShieldAlert
                                    size={20}
                                    className="mt-0.5 shrink-0 text-amber-700"
                                    aria-hidden
                                />
                                <div className="text-sm leading-relaxed">
                                    <p className="font-bold">
                                        Different account signed in
                                    </p>
                                    <p className="mt-1">
                                        This browser window is signed in as{" "}
                                        <span className="font-semibold">
                                            {userEmail}
                                        </span>
                                        , which does not match the student
                                        account signed in to the Escapture
                                        extension.
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted">
                                Sign in to the same student account in both the
                                web app and the extension, then start capture
                                again.
                            </p>
                        </div>
                    ) : state === "needs_enrollment" ? (
                        <div className="flex flex-col gap-4">
                            <Banner tone="attention">
                                You don&apos;t have a passkey registered for
                                this domain yet. Register a passkey first to
                                unlock evidence capturing.
                            </Banner>
                            <div>
                                <Link
                                    href="/account/security"
                                    className={buttonClass("primary")}>
                                    Set up your passkey
                                </Link>
                            </div>
                        </div>
                    ) : state === "expired" || state === "not_found" ? (
                        <div className="flex flex-col items-center py-4 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                                <AlertTriangle
                                    size={24}
                                    strokeWidth={2}
                                    aria-hidden
                                />
                            </div>
                            <h2 className="mt-3 text-lg font-bold text-ink">
                                Verification request expired
                            </h2>
                            <p className="mt-1.5 text-sm text-muted">
                                Open the Escapture extension on your Facebook
                                tab and click{" "}
                                <span className="font-semibold text-ink">
                                    Start capture
                                </span>{" "}
                                to begin a fresh check.
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => checkStatus()}
                                    className="rounded-full px-5 text-sm">
                                    Check again
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => window.close()}
                                    className="h-10 rounded-full border border-border px-5 text-sm font-semibold text-muted hover:bg-black/5 cursor-pointer">
                                    Close window
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm leading-relaxed text-muted">
                                Use your passkey (Windows Hello PIN,
                                fingerprint, face, or Google Password Manager)
                                to unlock evidence capturing for your current
                                Facebook tab.
                            </p>

                            {error && <Banner tone="attention">{error}</Banner>}

                            <div className="flex flex-col gap-3 pt-1">
                                <Button
                                    type="button"
                                    onClick={handleVerify}
                                    loading={busy}
                                    className="h-11 w-full justify-center rounded-full text-base font-semibold">
                                    <KeyRound
                                        size={18}
                                        strokeWidth={2.25}
                                        aria-hidden
                                    />
                                    <span>
                                        {busy
                                            ? "Waiting for passkey prompt…"
                                            : "Verify with passkey"}
                                    </span>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
