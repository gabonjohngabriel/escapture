import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { requireUser } from "@/server/auth";
import { badRequest } from "@/server/errors";
import { handle, json } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { verifyRegistration } from "@/server/services/passkeys";

export const POST = handle(async (req) => {
  const user = await requireUser({ roles: ["student"] });
  rateLimit(`passkey-reg-verify:${user.id}`, 10, 60_000);
  const body = (await req.json()) as {
    challengeId?: unknown;
    response?: unknown;
    label?: unknown;
  };
  if (typeof body?.challengeId !== "string" || !body.challengeId.trim()) {
    throw badRequest("challengeId is required.");
  }
  if (!body?.response || typeof body.response !== "object") {
    throw badRequest("Passkey attestation response is required.");
  }
  const label = typeof body.label === "string" ? body.label : undefined;
  return json(
    await verifyRegistration(user, {
      challengeId: body.challengeId.trim(),
      response: body.response as RegistrationResponseJSON,
      label,
    }),
  );
});
