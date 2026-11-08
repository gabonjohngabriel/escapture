"use client";

import { Eye, EyeOff } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/cn";

interface PrivacyBlurContextValue {
  blurred: boolean;
  toggleBlur: () => void;
  setBlur: (value: boolean) => void;
}

const PrivacyBlurContext = createContext<PrivacyBlurContextValue>({
  blurred: false,
  toggleBlur: () => {},
  setBlur: () => {},
});

const STORAGE_KEY = "escapture:privacy-blur";
const COOKIE_NAME = "escapture_privacy_blur";

const blurListeners = new Set<() => void>();

function subscribeBlur(callback: () => void) {
  blurListeners.add(callback);
  return () => {
    blurListeners.delete(callback);
  };
}

function getClientBlur(fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
  } catch {}
  return fallback;
}

export function PrivacyBlurProvider({
  initialBlur = false,
  children,
}: {
  initialBlur?: boolean;
  children: React.ReactNode;
}) {
  const blurred = useSyncExternalStore(
    subscribeBlur,
    () => getClientBlur(initialBlur),
    () => initialBlur,
  );

  const setBlur = (val: boolean) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(val));
      document.cookie = `${COOKIE_NAME}=${val}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    blurListeners.forEach((l) => l());
  };

  const toggleBlur = () => setBlur(!blurred);

  // Keep cookie in sync with current blur state for SSR consistency on reloads
  useEffect(() => {
    try {
      document.cookie = `${COOKIE_NAME}=${blurred}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, [blurred]);

  // Global keyboard shortcuts: Alt+P or double-tap Escape within 500ms
  useEffect(() => {
    let lastEsc = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing in an input/textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setBlur(!blurred);
        return;
      }

      if (e.key === "Escape" && !isInput) {
        const now = Date.now();
        if (now - lastEsc < 500) {
          setBlur(!blurred);
          lastEsc = 0;
        } else {
          lastEsc = now;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <PrivacyBlurContext.Provider value={{ blurred, toggleBlur, setBlur }}>
      <div data-privacy-blur={blurred ? "true" : "false"} className="min-h-screen">
        {children}
      </div>
    </PrivacyBlurContext.Provider>
  );
}

export function usePrivacyBlur() {
  return useContext(PrivacyBlurContext);
}

/**
 * Trauma-informed Privacy Blur toggle button for students in public spaces
 * (library, campus computer lab). Blurs sensitive content until hovered.
 */
export function PrivacyBlurToggle({ className }: { className?: string }) {
  const { blurred, toggleBlur } = usePrivacyBlur();

  return (
    <button
      type="button"
      onClick={toggleBlur}
      aria-pressed={blurred}
      title={
        blurred
          ? "Privacy Blur: ACTIVE (Alt+P to reveal) — Flagged captures are blurred"
          : "Privacy Blur: OFF (Alt+P or double-Esc to hide captures containing flagged words)"
      }
      className={cn(
        "relative flex size-10 items-center justify-center rounded-full transition-colors cursor-pointer",
        blurred
          ? "bg-brand-500 text-white shadow-xs hover:bg-brand-600 focus-visible:outline-brand-700"
          : "text-muted hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-brand-700",
        className,
      )}
    >
      {blurred ? (
        <EyeOff size={18} strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Eye size={18} strokeWidth={2} aria-hidden="true" />
      )}
      <span className="sr-only">
        {blurred ? "Disable Privacy Blur (Alt+P)" : "Enable Privacy Blur (Alt+P)"}
      </span>
      {blurred && (
        <span
          className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-card"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
