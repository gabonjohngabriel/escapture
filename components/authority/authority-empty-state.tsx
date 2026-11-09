"use client";

import { FolderKanban, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AuthorityEmptyState({
  title = "No cases currently referred",
  description = "When the university escalates a severe incident or requests external legal intervention, cases will appear here.",
  actionLabel = "Check for new referrals",
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500 bg-card p-12 text-center shadow-xs">
      <button
        type="button"
        aria-label="Refresh oversight cases"
        onClick={handleRefresh}
        disabled={isPending}
        className="absolute top-6 right-6 flex size-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-xs transition-colors hover:bg-brand-700 disabled:opacity-50"
        title="Refresh"
      >
        <RefreshCcw
          size={18}
          strokeWidth={2.25}
          className={isPending ? "animate-spin" : ""}
          aria-hidden
        />
      </button>

      <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <FolderKanban size={32} strokeWidth={2} aria-hidden />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-brand-800 tracking-tight">
        {title}
      </h2>

      <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted">
        {description}
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? "Checking for updates..." : actionLabel}
        </button>
      </div>
    </div>
  );
}
