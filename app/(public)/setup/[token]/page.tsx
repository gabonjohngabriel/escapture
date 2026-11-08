import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SetupForm } from "@/components/auth/setup-form";
import { Skeleton } from "@/components/ui/feedback";
import { setupInfo } from "@/server/services/admin";

// A new reviewer opens the one-time link their administrator gave them and chooses a password.
async function Setup({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const account = await setupInfo(token);
  if (!account) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-ink">This setup link isn&apos;t valid</h1>
        <p className="text-sm text-muted">
          It may have been used already, or it is more than 7 days old. Ask your administrator for a new one.
        </p>
        <div>
          <Link href="/sign-in" className="link text-sm">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Set up your reviewer account</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          <strong className="text-ink">{account.name}</strong>, choose a secure password for{" "}
          <strong className="text-ink">{account.email}</strong>. You will sign in with it from now on.
        </p>
      </div>
      <SetupForm token={token} />
    </>
  );
}

export default function SetupPage({ params }: PageProps<"/setup/[token]">) {
  return (
    <article className="overflow-hidden rounded-2xl border border-brand-500/40 bg-card shadow-soft">
      {/* Green Security Banner */}
      <div className="flex items-center gap-3 bg-brand-500 px-6 py-4 text-white">
        <div
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-white/40 bg-white/10"
        >
          <ShieldCheck size={18} strokeWidth={2} className="text-white" />
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Account Setup</span>
          <h2 className="text-lg font-bold leading-tight text-white">Reviewer Desk Access</h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <Setup params={params} />
        </Suspense>
      </div>
    </article>
  );
}
