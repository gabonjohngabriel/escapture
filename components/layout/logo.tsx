import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The Escapture logo: the shield-and-fingerprint mark from public/brand, with the name beside it.
 */
export function Logo({
  size = 40,
  withName = true,
  animateName = false,
  className,
  nameClassName,
}: {
  size?: number;
  withName?: boolean;
  animateName?: boolean;
  className?: string;
  nameClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center select-none overflow-hidden", className)}>
      <div className="flex size-14 shrink-0 items-center justify-center">
        <Image
          src="/brand/logo-mark.png"
          width={size}
          height={size}
          alt="Escapture"
          priority
          className="shrink-0 transition-transform duration-200"
        />
      </div>
      {animateName ? (
        <span
          className={cn(
            "whitespace-nowrap overflow-hidden font-bold tracking-tight text-[#52946B] leading-none transition-all duration-250 ease-out pl-1",
            withName
              ? "max-w-[200px] opacity-100 translate-x-0"
              : "max-w-0 opacity-0 -translate-x-2 pointer-events-none",
            nameClassName
          )}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Escapture
        </span>
      ) : (
        withName && (
          <span
            className={cn(
              "text-[24px] font-bold tracking-tight text-[#52946B] leading-none pl-1",
              nameClassName
            )}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Escapture
          </span>
        )
      )}
    </span>
  );
}
