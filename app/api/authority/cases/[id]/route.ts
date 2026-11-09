import { uuid } from "@/lib/validators";
import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { getOversightCase } from "@/server/services/authority";

export const GET = handle<{ id: string }>(async (_req, { id }) => {
  const user = await requireUser({ roles: ["authority", "reviewer", "admin"] });
  return json(await getOversightCase(user, uuid.parse(id)));
});
