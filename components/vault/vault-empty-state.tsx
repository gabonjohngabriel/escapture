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
    <div className="flex flex-col items-center justify-center rounded-[24px] border-[2px] border-[#52946B] bg-white p-12 text-center shadow-xs">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#F2F7F4] text-[#52946B]">
        <Folder size={32} strokeWidth={2} aria-hidden />
      </div>

      <h2 className="mt-5 text-[24px] font-bold text-[#4A8B63] tracking-tight">
        Your private vault starts here
      </h2>

      <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-[#5F856E]">
        Capture evidence when you&apos;re ready. Your captures stay private;
        nothing is shared with the university unless you choose and confirm it.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
        <HowToCapture
          variant="primary"
          hideIcon
          className="rounded-full bg-[#52946B] px-6 py-2.5 text-[14px] font-bold text-white shadow-xs hover:bg-[#437C58]"
          label="Capture evidence"
        />
        <HowToCapture
          variant="secondary"
          hideIcon
          className="rounded-full border border-[#DCE5DF] bg-white px-6 py-2.5 text-[14px] font-bold text-[#3F7855] hover:bg-[#F2F7F4]"
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
    <div className="relative flex flex-col items-center justify-center rounded-[24px] border-[2px] border-[#52946B] bg-white p-12 text-center shadow-xs">
      <button
        type="button"
        aria-label="Refresh shared items"
        onClick={() => router.refresh()}
        className="absolute top-6 right-6 flex size-9 items-center justify-center rounded-full bg-[#52946B] text-white shadow-xs transition-colors hover:bg-[#437C58]"
        title="Refresh"
      >
        <RefreshCcw size={18} strokeWidth={2.25} aria-hidden />
      </button>

      <div className="flex size-16 items-center justify-center rounded-full bg-[#F2F7F4] text-[#52946B]">
        <Folder size={32} strokeWidth={2} aria-hidden />
      </div>

      <h2 className="mt-5 text-[24px] font-bold text-[#4A8B63] tracking-tight">
        Nothing has been shared with you yet
      </h2>

      <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-[#5F856E]">
        Evidence will appear here when someone explicitly shares it with you.
        You can only view items you have permission to access.
      </p>

      <div className="mt-6">
        <Link
          href="/vault"
          className="inline-flex items-center justify-center rounded-full bg-[#52946B] px-6 py-2.5 text-[14px] font-bold text-white shadow-xs transition-colors hover:bg-[#437C58]"
        >
          Go to My Evidences
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
    <div className="relative flex flex-col items-center justify-center rounded-[24px] border-[2px] border-[#52946B] bg-white p-12 text-center shadow-xs">
      <button
        type="button"
        aria-label="Refresh"
        onClick={() => router.refresh()}
        className="absolute top-6 right-6 flex size-9 items-center justify-center rounded-full bg-[#52946B] text-white shadow-xs transition-colors hover:bg-[#437C58]"
        title="Refresh"
      >
        <RefreshCcw size={18} strokeWidth={2.25} aria-hidden />
      </button>

      <div className="flex size-16 items-center justify-center rounded-full bg-[#F2F7F4] text-[#52946B]">
        <FileX size={32} strokeWidth={2} aria-hidden />
      </div>

      <h2 className="mt-5 text-[24px] font-bold text-[#4A8B63] tracking-tight">
        This shared item is no longer available
      </h2>

      <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-[#5F856E]">
        Your permission to view this item may have changed. Its content and
        details are not shown to protect the owner&apos;s privacy.
      </p>

      <div className="mt-6">
        <Link
          href="/vault?tab=shared"
          className="inline-flex items-center justify-center rounded-full bg-[#52946B] px-6 py-2.5 text-[14px] font-bold text-white shadow-xs transition-colors hover:bg-[#427A56]"
        >
          Back to shared evidence
        </Link>
      </div>
    </div>
  );
}
