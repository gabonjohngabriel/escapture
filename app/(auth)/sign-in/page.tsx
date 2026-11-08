import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { allowedEmailDomain } from "@/lib/email-domain";

export default function SignInPage() {
  const domain = allowedEmailDomain();
  return (
    <AuthShell illustration="sign-in">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <h1 className="text-[36px] font-bold tracking-tight text-[#52946B] leading-tight font-sans">
        Sign in
      </h1>
      <Suspense fallback={null}>
        <AuthForm mode="sign-in" domain={domain} />
      </Suspense>
    </AuthShell>
  );
}
