// public-route: check verification request status for the popup window
import { badRequest } from "@/server/errors";
import { handle, json } from "@/server/http";
import { getVerifyRequestInfo } from "@/server/services/capture-grant";

export const GET = handle(async (req) => {
  const reqId = new URL(req.url).searchParams.get("req")?.trim();
  if (!reqId) throw badRequest("req query parameter is required.");
  return json(await getVerifyRequestInfo(reqId));
});
