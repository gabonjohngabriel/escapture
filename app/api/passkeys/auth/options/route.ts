// public-route: WebAuthn assertion options generated for a valid single-use requestId
import { badRequest } from "@/server/errors";
import { handle, json } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { authOptions } from "@/server/services/capture-grant";

export const POST = handle(async (req) => {
  const body = (await req.json()) as { requestId?: unknown };
  if (typeof body?.requestId !== "string" || !body.requestId.trim()) {
    throw badRequest("requestId is required.");
  }
  const cleanId = body.requestId.trim();
  rateLimit(`passkey-auth-opt:${cleanId}`, 15, 60_000);
  return json(await authOptions(cleanId));
});
