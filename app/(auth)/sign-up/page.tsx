import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { allowedEmailDomain } from "@/lib/email-domain";

export default function SignUpPage() {
  const domain = allowedEmailDomain();
  return (
    <AuthShell illustration="register">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <h1 className="text-[36px] font-bold tracking-tight text-[#52946B] leading-tight font-sans">
        Create your account
      </h1>
      <Suspense fallback={null}>
        <AuthForm mode="sign-up" domain={domain} />
      </Suspense>
    </AuthShell>
  );
}
