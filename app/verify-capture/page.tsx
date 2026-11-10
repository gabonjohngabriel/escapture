import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyCaptureClient } from "@/components/account/verify-capture-client";
import { getUser } from "@/server/auth";
import { readDeviceTokenHash } from "@/server/device-binding";
import { getVerifyRequestInfo } from "@/server/services/capture-grant";

export const metadata: Metadata = {
    title: "Verify capture — Escapture",
};

export default function VerifyCapturePage({
    searchParams,
}: {
    searchParams: Promise<{ req?: string | string[] }>;
}) {
    return (
        <div className="w-full max-w-md">
            <Suspense fallback={<VerifyCaptureSkeleton />}>
                <VerifyCaptureContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

function VerifyCaptureSkeleton() {
    return (
        <div className="mx-auto my-8 max-w-lg">
            <div className="overflow-hidden rounded-2xl border-2 border-brand-500 bg-card shadow-md">
                <div className="bg-brand-500 px-6 py-5 text-white">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                        Security
                    </span>
                    <h1 className="text-xl font-bold text-white leading-snug">
                        Confirm it&apos;s you to capture
                    </h1>
                </div>
                <div className="p-6 text-center text-sm text-muted">
                    Loading verification details…
                </div>
            </div>
        </div>
    );
}

async function VerifyCaptureContent({
    searchParams,
}: {
    searchParams: Promise<{ req?: string | string[] }>;
}) {
    const params = await searchParams;
    const reqParam = Array.isArray(params.req) ? params.req[0] : params.req;
    const requestId = (reqParam ?? "").trim();

    const actor = await getUser();
    if (!actor) {
        return (
            <VerifyCaptureClient
                initialState="sign_in_required"
                requestId={requestId}
                userEmail=""
            />
        );
    }
    if (actor.role !== "student") {
        return (
            <VerifyCaptureClient
                initialState="account_mismatch"
                requestId={requestId}
                userEmail={actor.email}
                userName={actor.name}
            />
        );
    }

    const deviceTokenHash = await readDeviceTokenHash();
    const info = await getVerifyRequestInfo(requestId, actor, deviceTokenHash);

    const userEmail =
        "userEmail" in info && typeof info.userEmail === "string"
            ? info.userEmail
            : actor.email;
    const userName =
        "userName" in info && typeof info.userName === "string"
            ? info.userName
            : actor.name;

    return (
        <VerifyCaptureClient
            initialState={info.state}
            requestId={requestId}
            userEmail={userEmail}
            userName={userName}
        />
    );
}
