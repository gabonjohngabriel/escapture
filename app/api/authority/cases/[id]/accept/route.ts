import { z } from "zod";
import { uuid } from "@/lib/validators";
import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { acceptHandling } from "@/server/services/authority";

const schema = z.object({
  referralId: uuid,
});

export const POST = handle<{ id: string }>(async (req) => {
  const user = await requireUser({ roles: ["authority"] });
  const body = schema.parse(await req.json());
  return json(await acceptHandling(user, body.referralId));
});
