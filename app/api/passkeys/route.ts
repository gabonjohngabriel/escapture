import { requireUser } from "@/server/auth";
import { badRequest } from "@/server/errors";
import { handle, json } from "@/server/http";
import { listPasskeys, removePasskey } from "@/server/services/passkeys";

export const GET = handle(async () => {
  const user = await requireUser({ roles: ["student"] });
  return json(await listPasskeys(user));
});

export const DELETE = handle(async (req) => {
  const user = await requireUser({ roles: ["student"] });
  const url = new URL(req.url);
  let id = url.searchParams.get("id")?.trim();
  if (!id) {
    const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
    if (body && typeof body.id === "string") id = body.id.trim();
  }
  if (!id) throw badRequest("Passkey ID is required.");
  return json(await removePasskey(user, id));
});
