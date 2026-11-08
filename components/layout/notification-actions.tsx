"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { api, errorMessage } from "@/lib/client-api";

export function MarkAllRead() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await api("/api/notifications/read", { body: {} });
        } catch (err) {
          toast(errorMessage(err));
        }
        setLoading(false);
        router.refresh();
      }}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#52946B] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#427A56] hover:shadow disabled:opacity-50"
    >
      <CheckCheck size={18} strokeWidth={2.5} aria-hidden />
      <span>{loading ? "Marking..." : "Mark all as read"}</span>
    </button>
  );
}
