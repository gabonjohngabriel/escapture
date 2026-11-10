"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MobileNavMenu({
  links,
  accountSlot,
}: {
  links: { label: string; href: string }[];
  accountSlot: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when pressing Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close when resizing to desktop (>=768px)
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mql.matches) {
        setOpen(false);
      }
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <div ref={containerRef} className="relative md:hidden flex items-center">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mk-mobile-menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-10 items-center justify-center rounded-full text-brand-800 hover:bg-brand-50 active:bg-brand-100 transition focus-visible:outline-brand-600"
      >
        {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-16 sm:top-20 z-20 bg-ink/20 backdrop-blur-[2px] transition-opacity"
        />
      )}

      {/* Dropdown panel */}
      {open && (
        <div
          id="mk-mobile-menu"
          role="region"
          aria-label="Mobile Navigation"
          className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-border bg-card p-4 shadow-modal z-30 fade-in"
          onClick={(e) => {
            // Auto close when tapping any link
            if ((e.target as HTMLElement).closest("a")) {
              setOpen(false);
            }
          }}
        >
          <nav aria-label="Mobile section navigation" className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex h-11 items-center rounded-xl px-3 text-[16px] font-semibold text-brand-800 hover:bg-brand-50 active:bg-brand-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="h-px bg-border my-3" />

          <div className="flex flex-col gap-2.5">
            {/* Account / Sign In slot */}
            <div className="[&>a]:flex [&>a]:h-11 [&>a]:w-full [&>a]:items-center [&>a]:justify-center [&>a]:rounded-full [&>a]:border [&>a]:border-border [&>a]:bg-canvas [&>a]:font-semibold [&>a]:text-brand-800 [&>a]:hover:bg-brand-50">
              {accountSlot}
            </div>

            {/* Primary CTA */}
            <Link
              href="/sign-up"
              className="flex h-11 w-full items-center justify-center rounded-full bg-brand-600 font-bold text-white shadow-xs hover:bg-brand-700 active:bg-brand-800 transition"
            >
              Start Your Vault
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
