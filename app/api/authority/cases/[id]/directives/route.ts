import { z } from "zod";
import { uuid } from "@/lib/validators";
import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { submitDirectives } from "@/server/services/authority";

const schema = z.object({
  referralId: uuid,
  actionType: z.string().min(3).max(200),
  directives: z.string().min(5).max(4000),
  urgency: z.enum(["standard", "priority", "immediate"]),
  investigationMilestone: z.string().max(500).optional(),
});

export const POST = handle<{ id: string }>(async (req) => {
  const user = await requireUser({ roles: ["authority"] });
  const body = schema.parse(await req.json());
  return json(
    await submitDirectives(user, body.referralId, {
      actionType: body.actionType,
      directives: body.directives,
      urgency: body.urgency,
      investigationMilestone: body.investigationMilestone,
    }),
    201,
  );
});
