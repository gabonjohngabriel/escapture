"use client";

import { KeyRound, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Banner } from "@/components/ui/feedback";
import { api, errorMessage } from "@/lib/client-api";
import { formatDateTime } from "@/lib/format";

export type StudentPasskeyRow = {
  id: string;
  name: string;
  email: string;
  passkeyCount: number;
  lastUsedAt: Date | string | null;
};

export function StudentPasskeyReset({
  students,
}: {
  students: StudentPasskeyRow[];
}) {
  const router = useRouter();
  const [target, setTarget] = useState<StudentPasskeyRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleReset() {
    if (!target) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await api(`/api/admin/students/${encodeURIComponent(target.id)}/passkeys`, {
        method: "DELETE",
      });
      setSuccess(`Reset passkey and device link for ${target.name} (${target.email}). They can now link a new device.`);
      setTarget(null);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-brand-500/40 bg-card p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
          <KeyRound size={18} strokeWidth={2} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-800">
            Student passkey &amp; device recovery
          </h2>
          <p className="text-sm text-muted">
            If a student switches laptops or loses their linked browser, reset their passkey and device binding here so they can link a new device on their Security page.
          </p>
        </div>
      </div>

      {error && <Banner tone="attention">{error}</Banner>}
      {success && <Banner tone="success">{success}</Banner>}

      {students.length === 0 ? (
        <p className="text-sm text-muted">No student accounts found.</p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{s.name}</p>
                <p className="truncate text-xs text-muted">{s.email}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-muted">
                  <span className="tnum font-semibold text-ink">
                    {s.passkeyCount} {s.passkeyCount === 1 ? "passkey" : "passkeys"}
                  </span>
                  {s.lastUsedAt && (
                    <span className="block">
                      Last used {formatDateTime(s.lastUsedAt)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={s.passkeyCount === 0}
                  onClick={() => setTarget(s)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-ink transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw size={13} aria-hidden />
                  <span>Reset passkey &amp; device</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Reset passkey and linked device?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger-solid" onClick={handleReset} loading={busy}>
              Reset passkey &amp; device
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink">
          This will remove all {target?.passkeyCount} registered passkey(s), unlink the bound browser/device, and revoke any active capture grants for{" "}
          <span className="font-semibold text-ink">{target?.name}</span> ({target?.email}). They will need to link a new device passkey before capturing evidence.
        </p>
      </Dialog>
    </section>
  );
}
