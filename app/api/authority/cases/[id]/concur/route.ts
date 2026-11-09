import { z } from "zod";
import { uuid } from "@/lib/validators";
import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { concurResolution } from "@/server/services/authority";

const schema = z.object({
  referralId: uuid,
  concurrence: z.boolean(),
  remarks: z.string().max(2000).default(""),
});

export const POST = handle<{ id: string }>(async (req) => {
  const user = await requireUser({ roles: ["authority"] });
  const body = schema.parse(await req.json());
  return json(
    await concurResolution(user, body.referralId, {
      concurrence: body.concurrence,
      remarks: body.remarks,
    }),
  );
});
