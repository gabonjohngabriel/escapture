import { PageCrumbs } from "@/components/layout/app-shell";
import { PasskeyManager } from "@/components/account/passkey-manager";
import { pageUser } from "@/server/page-auth";
import { listPasskeys } from "@/server/services/passkeys";

export const instant = false;

export default async function AccountSecurityPage() {
  const user = await pageUser(["student"]);
  const { items, rpId, hasMismatchedPasskeys, hasDeviceBinding } = await listPasskeys(user);

  return (
    <div className="flex flex-col gap-6">
      <PageCrumbs title="Passkeys & security" section="/vault" />

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
          Passkeys &amp; security
        </h1>
        <p className="max-w-2xl text-base text-muted">
          Link your account 1-to-1 with this laptop using Windows Hello, Touch ID, or Chrome Passkey. Captures can only be unlocked from your linked browser.
        </p>
      </div>

      <PasskeyManager
        initialItems={items}
        rpId={rpId}
        hasMismatchedPasskeys={hasMismatchedPasskeys}
        hasDeviceBinding={hasDeviceBinding}
      />
    </div>
  );
}
