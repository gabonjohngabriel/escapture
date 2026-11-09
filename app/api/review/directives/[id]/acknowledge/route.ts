import { z } from "zod";
import { uuid } from "@/lib/validators";
import { requireUser } from "@/server/auth";
import { STAFF } from "@/server/authz";
import { handle, json } from "@/server/http";
import { acknowledgeDirective } from "@/server/services/authority";

const schema = z.object({
  acknowledgment: z.enum(["adopted", "acknowledged", "declined"]),
  remarks: z.string().max(1000).optional(),
});

export const POST = handle<{ id: string }>(async (req, { id }) => {
  const user = await requireUser({ roles: STAFF });
  const body = schema.parse(await req.json());
  return json(await acknowledgeDirective(user, uuid.parse(id), body));
});
