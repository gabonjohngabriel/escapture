// public-route: WebAuthn assertion verification authenticated cryptographically by passkey signature
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { badRequest } from "@/server/errors";
import { handle, json } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { verifyAuth } from "@/server/services/capture-grant";

export const POST = handle(async (req) => {
  const body = (await req.json()) as {
    requestId?: unknown;
    response?: unknown;
  };
  if (typeof body?.requestId !== "string" || !body.requestId.trim()) {
    throw badRequest("requestId is required.");
  }
  const cleanId = body.requestId.trim();
  rateLimit(`passkey-auth-verify:${cleanId}`, 10, 60_000);
  if (!body?.response || typeof body.response !== "object") {
    throw badRequest("Passkey assertion response is required.");
  }
  return json(
    await verifyAuth({
      requestId: cleanId,
      response: body.response as AuthenticationResponseJSON,
    }),
  );
});
