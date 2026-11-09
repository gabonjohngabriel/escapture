import { requireUser } from "@/server/auth";
import { handle, json } from "@/server/http";
import { listReferredCases, type Agency } from "@/server/services/authority";

export const GET = handle(async (req) => {
  const user = await requireUser({ roles: ["authority", "reviewer", "admin"] });
  const url = new URL(req.url);
  const agency = url.searchParams.get("agency") as Agency | undefined;
  const status = url.searchParams.get("status") || undefined;
  const search = url.searchParams.get("q") || undefined;

  return json(await listReferredCases(user, { agency, status, search }));
});
