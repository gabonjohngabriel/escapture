import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { allowedEmailDomain } from "@/lib/email-domain";
import { getUser, homeFor } from "@/server/auth";

/** The address new accounts must use; the same setting the sign-up gate reads. */
export const emailDomain = allowedEmailDomain;

const ghost = "px-4 py-2 text-[15px] font-semibold text-brand-700 hover:text-brand-800 transition rounded-full";

// Reads the session, so it streams in behind Suspense and the rest of the page stays static.
async function Account() {
  const user = await getUser();
  return user ? (
    <Link href={homeFor(user.role)} className={ghost}>
      Open Escapture
    </Link>
  ) : (
    <SignIn />
  );
}
const SignIn = () => (
  <Link href="/sign-in" className={ghost}>
    Sign In
  </Link>
);

const links = [
  { label: "How It Works", href: "/#how" },
  { label: "Verification & Privacy", href: "/#trust" },
  { label: "For Authorities", href: "/#authorities" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link href="/" className="flex items-center gap-2 group transition" aria-label="Escapture home">
            <Logo size={42} />
          </Link>

          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[16px] font-medium text-brand-700 hover:text-brand-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center">
          <div className="bg-card border border-brand-200/60 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.04)] rounded-full p-1.5 flex items-center gap-2">
            <Suspense fallback={<SignIn />}>
              <Account />
            </Suspense>
            <Link
              href="/sign-up"
              className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-[15px] px-6 py-2.5 rounded-full shadow-sm transition-all text-center whitespace-nowrap"
            >
              Start Your Vault
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

const columns = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "/#how" },
      // There is no store listing yet: the install steps are in the vault, under "How to capture".
      { label: "Escapture extension", href: "/vault" },
      { label: "For Reviewers & Authorities", href: "/#authorities" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Contact the team", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mk-footer border-t border-border mt-auto bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mk-footer-grid">
          <div className="flex flex-col items-start gap-3">
            <Logo size={28} />
            <p className="max-w-[36ch] text-[15px] leading-6 text-muted">
              Keep evidence of what happened online and share it with your university when you&apos;re ready.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mk-footer-note">
          Escapture supplements Bulacan State University&apos;s existing process. It does not replace it.
        </p>
      </div>
    </footer>
  );
}
