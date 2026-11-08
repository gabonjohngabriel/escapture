"use client";

import {
  browserSupportsWebAuthn,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import { AlertTriangle, CheckCircle2, KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Banner } from "@/components/ui/feedback";
import { Input } from "@/components/ui/field";
import { api, errorMessage } from "@/lib/client-api";
import { formatDateTime } from "@/lib/format";
import type { PasskeyItem } from "@/server/services/passkeys";

export function PasskeyManager({
  initialItems,
  rpId,
  hasMismatchedPasskeys,
}: {
  initialItems: PasskeyItem[];
  rpId: string;
  hasMismatchedPasskeys: boolean;
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PasskeyItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAddPasskey(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!browserSupportsWebAuthn()) {
      setError("This browser does not support passkeys (WebAuthn). Use a modern version of Chrome or Edge.");
      return;
    }

    setBusy(true);
    try {
      const { challengeId, options } = await api<{
        challengeId: string;
        options: PublicKeyCredentialCreationOptionsJSON;
      }>("/api/passkeys/register/options", { body: {} });

      const attResp = await startRegistration({ optionsJSON: options });

      await api("/api/passkeys/register/verify", {
        body: {
          challengeId,
          response: attResp,
          label: label.trim() || "Windows Hello / Passkey",
        },
      });

      setLabel("");
      setSuccess("Passkey registered! You can now use it to unlock evidence capturing in the extension.");
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.name === "InvalidStateError") {
        setError("A passkey for this authenticator is already registered on your account.");
      } else if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Passkey setup was cancelled or timed out. Try again when ready.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await api(`/api/passkeys?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      setSuccess(`Removed "${deleteTarget.label}".`);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {hasMismatchedPasskeys && (
        <Banner tone="attention">
          One or more of your earlier passkeys were created under a different domain than{" "}
          <span className="font-mono font-semibold">{rpId}</span>. Please add a new passkey for this domain to continue capturing.
        </Banner>
      )}

      {error && <Banner tone="attention">{error}</Banner>}
      {success && <Banner tone="success">{success}</Banner>}

      {/* Add Passkey Card */}
      <section className="overflow-hidden rounded-2xl border-2 border-brand-500 bg-card shadow-xs">
        <div className="flex items-center justify-between bg-brand-500 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/10">
              <KeyRound size={20} strokeWidth={2} aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-snug">
                Register a passkey
              </h2>
              <p className="text-xs text-white/85">
                Use Windows Hello PIN, biometrics, Google Password Manager, or a phone passkey
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddPasskey} className="flex flex-col gap-4 p-6">
          <div className="max-w-md">
            <Input
              id="passkey-label"
              label="Passkey nickname (optional)"
              hint="You can register multiple passkeys across your devices so you have a backup."
              type="text"
              maxLength={60}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. My Laptop (Windows Hello) or Google Password Manager"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={busy} className="rounded-full px-5">
              <Plus size={16} strokeWidth={2.25} aria-hidden />
              <span>{busy ? "Waiting for device prompt…" : "Add passkey"}</span>
            </Button>
          </div>
        </form>
      </section>

      {/* Registered Passkeys List */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-800">
            Your registered passkeys ({initialItems.length})
          </h2>
          <span className="text-xs text-muted">
            Domain: <span className="font-mono font-medium text-ink">{rpId}</span>
          </span>
        </div>

        {initialItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <ShieldCheck size={24} strokeWidth={2} aria-hidden />
            </div>
            <h3 className="mt-3 text-base font-bold text-ink">
              No passkeys registered yet
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted">
              Add at least one passkey above. The Escapture Chrome extension requires a passkey check before you can capture evidence.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {initialItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-brand-500/40 bg-card p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                      <KeyRound size={17} strokeWidth={2} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold text-ink">
                          {item.label}
                        </h3>
                        {item.rpIdMatches ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-semibold text-brand-800">
                            <CheckCircle2 size={12} aria-hidden />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                            <AlertTriangle size={12} aria-hidden />
                            Different domain ({item.rpId})
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Added <span className="tnum font-medium text-ink">{formatDateTime(item.createdAt)}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Last used:{" "}
                        <span className="tnum font-medium text-ink">
                          {item.lastUsedAt ? formatDateTime(item.lastUsedAt) : "Never used"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 size={13} aria-hidden />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove passkey?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger-solid" onClick={handleConfirmDelete} loading={deleting}>
              Remove passkey
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-ink">{deleteTarget?.label}</span>? If you remove all of your passkeys, you will need to register a new one before capturing evidence in the extension.
        </p>
      </Dialog>
    </div>
  );
}
