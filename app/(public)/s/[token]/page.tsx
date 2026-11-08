import { Lock } from "lucide-react";
import { Suspense } from "react";
import { RedeemForm } from "@/components/auth/redeem-form";
import { Skeleton } from "@/components/ui/feedback";
import { pageUser } from "@/server/page-auth";
import { linkMeta } from "@/server/services/links";

async function Redeem({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await pageUser();
  const meta = await linkMeta(token);
  if (!meta.valid) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-ink">This link isn&apos;t valid</h1>
        <p className="text-sm text-muted">
          It may have been mistyped, expired, or revoked. Ask the person who shared it to send it again.
        </p>
      </div>
    );
  }
  const what = meta.resourceType === "case" ? "a private report" : "a piece of captured evidence";
  return (
    <>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Enter link password</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Someone shared {what} with you. Enter the password they gave you to unlock and access it securely.
        </p>
      </div>
      <RedeemForm token={token} />
    </>
  );
}

export default function SharedLinkPage({ params }: PageProps<"/s/[token]">) {
  return (
    <article className="overflow-hidden rounded-2xl border border-brand-500/40 bg-card shadow-soft">
      {/* Green Security Banner */}
      <div className="flex items-center gap-3 bg-brand-500 px-6 py-4 text-white">
        <div
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-white/40 bg-white/10"
        >
          <Lock size={18} strokeWidth={2} className="text-white" />
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Protected Link</span>
          <h2 className="text-lg font-bold leading-tight text-white">Open shared evidence or report</h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <Redeem params={params} />
        </Suspense>
      </div>
    </article>
  );
}
