import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { adminResetPasskeys } from "@/server/services/passkeys";

export const DELETE = handle<{ id: string }>(async (_req, { id }) => {
  const admin = await requireUser({ roles: ["admin"] });
  return json(await adminResetPasskeys(admin, id));
});
