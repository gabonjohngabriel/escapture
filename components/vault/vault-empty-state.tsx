"use client";

import { FileX, Folder, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HowToCapture } from "./how-to-capture";

/**
 * Empty Vault State matching Figma node 37:5761
 */
export function EmptyVaultState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500 bg-card p-12 text-center shadow-xs">
      <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Folder size={32} strokeWidth={2} aria-hidden />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-brand-800 tracking-tight">
        Your private vault starts here
      </h2>

      <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted">
        Capture evidence when you&apos;re ready. Your captures stay private;
        nothing is shared with the university unless you choose and confirm it.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
        <HowToCapture
          variant="primary"
          hideIcon
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-brand-700"
          label="Capture evidence"
        />
        <HowToCapture
          variant="secondary"
          hideIcon
          className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-brand-800 hover:bg-brand-50"
          label="How to use the extension"
        />
      </div>
    </div>
  );
}

/**
 * Empty Shared With Me State matching Figma node 32:5399
 */
export function EmptySharedState() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500 bg-card p-12 text-center shadow-xs">
      <button
        type="button"
        aria-label="Refresh shared items"
        onClick={() => router.refresh()}
        className="absolute top-6 right-6 flex size-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-xs transition-colors hover:bg-brand-700"
        title="Refresh"
      >
        <RefreshCcw size={18} strokeWidth={2.25} aria-hidden />
      </button>

      <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Folder size={32} strokeWidth={2} aria-hidden />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-brand-800 tracking-tight">
        Nothing has been shared with you yet
      </h2>

      <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted">
        Evidence will appear here when someone explicitly shares it with you.
        You can only view items you have permission to access.
      </p>

      <div className="mt-6">
        <Link
          href="/vault"
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-brand-700"
        >
          Go to my evidence
        </Link>
      </div>
    </div>
  );
}

/**
 * Access Revoked / Unavailable State matching Figma node 37:6041
 */
export function AccessRevokedState() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500 bg-card p-12 text-center shadow-xs">
      <button
        type="button"
        aria-label="Refresh"
        onClick={() => router.refresh()}
        className="absolute top-6 right-6 flex size-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-xs transition-colors hover:bg-brand-700"
        title="Refresh"
      >
        <RefreshCcw size={18} strokeWidth={2.25} aria-hidden />
      </button>

      <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <FileX size={32} strokeWidth={2} aria-hidden />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-brand-800 tracking-tight">
        This shared item is no longer available
      </h2>

      <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted">
        Your permission to view this item may have changed. Its content and
        details are not shown to protect the owner&apos;s privacy.
      </p>

      <div className="mt-6">
        <Link
          href="/vault?tab=shared"
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-brand-700"
        >
          Back to shared evidence
        </Link>
      </div>
    </div>
  );
}
