import { requireUser } from "@/server/auth";
import { badRequest } from "@/server/errors";
import { handle, json } from "@/server/http";
import { grantStatus } from "@/server/services/capture-grant";

export const GET = handle(async (req) => {
  const user = await requireUser({ roles: ["student"] });
  const reqId = new URL(req.url).searchParams.get("req")?.trim();
  if (!reqId) throw badRequest("req query parameter is required.");
  return json(await grantStatus(user, reqId));
});
