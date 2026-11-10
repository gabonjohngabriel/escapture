import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { listPasskeys } from "@/server/services/passkeys";

export const GET = handle(async () => {
  const user = await requireUser({ roles: ["student"] });
  return json(await listPasskeys(user));
});
