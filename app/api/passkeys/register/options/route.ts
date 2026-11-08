import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { registrationOptions } from "@/server/services/passkeys";

export const POST = handle(async () => {
  const user = await requireUser({ roles: ["student"] });
  rateLimit(`passkey-reg-opt:${user.id}`, 10, 60_000);
  return json(await registrationOptions(user));
});
