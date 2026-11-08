import { PageCrumbs } from "@/components/layout/app-shell";
import { PasskeyManager } from "@/components/account/passkey-manager";
import { pageUser } from "@/server/page-auth";
import { listPasskeys } from "@/server/services/passkeys";

export const instant = false;

export default async function AccountSecurityPage() {
  const user = await pageUser(["student"]);
  const { items, rpId, hasMismatchedPasskeys } = await listPasskeys(user);

  return (
    <div className="flex flex-col gap-6">
      <PageCrumbs title="Passkeys & security" section="/vault" />

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
          Passkeys &amp; security
        </h1>
        <p className="max-w-2xl text-base text-muted">
          Protect your evidence captures with Windows Hello, Google Password Manager, or a hardware security key. A passkey check unlocks capturing in a Facebook tab for 15 minutes.
        </p>
      </div>

      <PasskeyManager
        initialItems={items}
        rpId={rpId}
        hasMismatchedPasskeys={hasMismatchedPasskeys}
      />
    </div>
  );
}
