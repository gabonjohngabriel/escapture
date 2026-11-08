import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { requestGrant } from "@/server/services/capture-grant";

export const POST = handle(async (req) => {
  const user = await requireUser({ roles: ["student"] });
  rateLimit(`grant-req:${user.id}`, 30, 60_000);
  const body = (await req.json().catch(() => ({}))) as { forceVerify?: unknown };
  return json(await requestGrant(user, { forceVerify: Boolean(body?.forceVerify) }));
});
