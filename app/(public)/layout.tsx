import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col justify-center gap-6 px-4 py-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2" title="Escapture">
            <Logo size={36} withName animateName nameClassName="text-[22px] font-bold text-brand-500 ml-1" />
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <ShieldCheck size={14} strokeWidth={2} className="text-brand-600" aria-hidden />
            <span>Secure Access</span>
          </span>
        </div>

        {children}

        <footer className="text-center text-xs text-muted">
          Protected by Escapture tamper-evident verification · End-to-end access control
        </footer>
      </main>
    </div>
  );
}
