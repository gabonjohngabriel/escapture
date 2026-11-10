import { Check, ChevronDown, Minus } from "lucide-react";
import Link from "next/link";
import { buttonClass, buttonLg, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** A link that looks like a button. The landing page's actions all lead somewhere. */
export function ButtonLink({
  href,
  variant = "primary",
  lg = false,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  lg?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, cn(lg && buttonLg, className))}>
      {children}
    </Link>
  );
}

/**
 * Seven open, flowing lines. Decoration only, behind the hero and the two dark
 * blocks. Never closed loops: those would read as the logo's fingerprint.
 */
export function TrailPattern({ dark = false }: { dark?: boolean }) {
  const paths = Array.from({ length: 7 }, (_, i) => {
    const y = 150 + i * 26;
    const a = 60 + i * 9;
    return `M-40 ${y + a} C 220 ${y - a}, 420 ${y + a * 1.3}, 660 ${y} S 1040 ${y - a * 0.9}, 1240 ${y + a * 0.4}`;
  });
  return (
    <svg
      aria-hidden
      className={cn("mk-trail", dark && "mk-trail-dark")}
      viewBox="0 0 1200 480"
      preserveAspectRatio="xMidYMid slice"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function Section({
  id,
  tone = "canvas",
  eyebrow,
  title,
  lead,
  center = false,
  inset = false,
  pattern = false,
  children,
}: {
  id?: string;
  tone?: "canvas" | "card" | "tint" | "dark";
  eyebrow?: string;
  title?: string;
  lead?: string;
  center?: boolean;
  inset?: boolean;
  pattern?: boolean;
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section id={id} className={cn("mk-section", dark ? "mk-dark" : `mk-tone-${tone}`, inset && "mk-inset")}>
      {pattern && <TrailPattern dark={dark} />}
      <div className="mk-wrap">
        {title && (
          <div className={cn("mk-section-head", center && "mk-center")}>
            {eyebrow && <span className="mk-eyebrow">{eyebrow}</span>}
            <h2 className="mk-display-lg">{title}</h2>
            {lead && <p className="mk-lead">{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/**
 * A picture of the product in a window. What is inside is an illustration, not
 * the working interface: it is one image to assistive technology, and nothing
 * in it can be focused or clicked.
 */
export function ProductFrame({ url, label, children }: { url: string; label: string; children: React.ReactNode }) {
  return (
    <div className="mk-frame" role="img" aria-label={label}>
      <div className="mk-frame-bar" aria-hidden>
        <i />
        <i />
        <i />
        <span className="mk-frame-url">{url}</span>
      </div>
      <div className="mk-frame-body" aria-hidden>
        {children}
      </div>
    </div>
  );
}

/** A button as drawn inside a product picture. Not a control. */
export function MockButton({
  variant = "primary",
  className,
  children,
}: {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={buttonClass(variant, cn("cursor-default", className))}>{children}</span>;
}

export function PilotStrip({
  items,
  label = "PILOT & COMPLIANCE",
}: {
  items: string[];
  label?: string;
}) {
  return (
    <div className="border-y border-border/70 bg-card/60 backdrop-blur-xs py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 text-center lg:text-left">
          {label && (
            <span className="text-[11px] font-bold tracking-wider text-brand-700/90 uppercase shrink-0">
              {label}
            </span>
          )}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
            {items.map((item, index) => (
              <span
                key={item}
                className={cn(
                  "inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium px-3.5 py-1.5 rounded-full border transition-colors shadow-2xs",
                  index === 0
                    ? "bg-brand-50 text-brand-900 border-brand-200 font-semibold"
                    : "bg-canvas text-muted border-border/80"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    index === 0 ? "bg-brand-600 animate-pulse" : "bg-brand-400"
                  )}
                  aria-hidden
                />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="mk-steps">
      {items.map((step, i) => (
        <li key={step.title} className="mk-step">
          <span className="mk-step-num" aria-hidden>
            {i + 1}
          </span>
          <h3 className="mk-h3">
            <span className="sr-only">Step {i + 1}: </span>
            {step.title}
          </h3>
          <p className="mk-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function FeatureRow({
  eyebrow,
  title,
  body,
  points,
  reverse = false,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  reverse?: boolean;
  /** The picture. */
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mk-feature", reverse && "mk-feature-rev")}>
      <div className="mk-feature-text">
        <span className="mk-eyebrow">{eyebrow}</span>
        <h2 className="mk-display-md">{title}</h2>
        <p>{body}</p>
        <ul className="mk-points">
          {points.map((point) => (
            <li key={point}>
              <Check size={16} strokeWidth={1.75} aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function TrustPanel({
  does,
  doesNot,
}: {
  does: { title: string; items: string[] };
  doesNot: { title: string; items: string[] };
}) {
  return (
    <div className="mk-trust">
      {[
        { ...does, Icon: Check },
        { ...doesNot, Icon: Minus },
      ].map(({ title, items, Icon }) => (
        <div key={title} className="mk-trust-col">
          <h3 className="mk-h3">{title}</h3>
          <ul>
            {items.map((item) => (
              <li key={item}>
                <Icon size={20} strokeWidth={1.75} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="max-w-3xl mx-auto divide-y divide-border/80 border-y border-border/80">
      {items.map((item, i) => (
        <details key={item.q} open={i === 0} className="group py-5 sm:py-6 transition-colors">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg">
            <span className="font-heading text-base sm:text-lg font-semibold text-brand-950 group-hover:text-brand-700 transition-colors">
              {item.q}
            </span>
            <div className="size-8 rounded-full bg-brand-50/80 border border-brand-200/60 flex items-center justify-center shrink-0 text-brand-700 group-hover:bg-brand-100 transition-colors">
              <ChevronDown
                size={18}
                strokeWidth={2}
                aria-hidden
                className="transition-transform duration-200 group-open:rotate-180"
              />
            </div>
          </summary>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({
  title,
  lead,
  trustBadges = [
    "SHA-256 tamper checks",
    "Private until escalated",
    "Student-controlled timeline",
  ],
  children,
}: {
  title: string;
  lead: string;
  trustBadges?: string[];
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-brand-900 text-on-dark p-8 sm:p-12 lg:p-16 text-center shadow-raised border border-brand-800">
          <TrailPattern dark />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-brand-100/90 leading-relaxed max-w-2xl mb-8">
              {lead}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-8">
              {children}
            </div>
            {trustBadges && trustBadges.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 pt-6 border-t border-brand-800/80 w-full">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-brand-200"
                  >
                    <Check size={16} className="text-brand-300" strokeWidth={2.5} aria-hidden />
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
