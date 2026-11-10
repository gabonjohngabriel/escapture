import { requireUser } from "@/server/auth";
import { readDeviceTokenHash } from "@/server/device-binding";
import { badRequest } from "@/server/errors";
import { handle, json } from "@/server/http";
import { getVerifyRequestInfo } from "@/server/services/capture-grant";

export const GET = handle(async (req) => {
  const user = await requireUser({ roles: ["student"] });
  const reqId = new URL(req.url).searchParams.get("req")?.trim();
  if (!reqId) throw badRequest("req query parameter is required.");
  const deviceTokenHash = await readDeviceTokenHash();
  return json(await getVerifyRequestInfo(reqId, user, deviceTokenHash));
});
