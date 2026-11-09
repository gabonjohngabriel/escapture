import { z } from "zod";
import { uuid } from "@/lib/validators";
import { requireUser } from "@/server/auth";
import { STAFF } from "@/server/authz";
import { handle, json } from "@/server/http";
import { createReferral } from "@/server/services/authority";

const schema = z.object({
  targetAgency: z.enum(["barangay", "vawc", "pnp_acg", "nbi_cybercrime"]),
  severity: z.enum(["routine", "moderate", "severe", "critical"]),
  referralReason: z.string().min(5).max(2000),
});

export const POST = handle<{ id: string }>(async (req, { id }) => {
  const user = await requireUser({ roles: STAFF });
  const body = schema.parse(await req.json());
  return json(await createReferral(user, uuid.parse(id), body), 201);
});
