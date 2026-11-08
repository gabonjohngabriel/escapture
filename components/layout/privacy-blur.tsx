"use client";

import { Eye, EyeOff } from "lucide-react";
import React, { createContext, useContext, useEffect, useState } from "react";
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

function getInitialBlur(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function PrivacyBlurProvider({ children }: { children: React.ReactNode }) {
  const [blurred, setBlurred] = useState(getInitialBlur);

  const setBlur = (val: boolean) => {
    setBlurred(val);
    try {
      sessionStorage.setItem(STORAGE_KEY, String(val));
    } catch {}
  };

  const toggleBlur = () => setBlur(!blurred);

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
        toggleBlur();
        return;
      }

      if (e.key === "Escape" && !isInput) {
        const now = Date.now();
        if (now - lastEsc < 500) {
          toggleBlur();
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
