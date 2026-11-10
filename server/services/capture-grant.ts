import { randomUUID } from "node:crypto";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransport,
} from "@simplewebauthn/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { safeEqual } from "@/lib/hash";
import type { Actor } from "../auth";
import { assertRole } from "../authz";
import { AppError, badRequest, forbidden, notFound } from "../errors";

export const GRANT_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const REQUEST_TTL_MS = 5 * 60 * 1000; // 5 minutes to complete the prompt

/**
 * Pure check for whether a capture grant authorizes an upload.
 * Exported for direct unit testing without a database.
 */
export function evaluateCaptureGrant(params: {
  requireCapturePasskey: boolean;
  grant: { userId: string; sessionId: string; expiresAt: Date } | null;
  actorId: string;
  sessionId: string;
  now?: number;
}): "ok" | "passkey_required" {
  if (!params.requireCapturePasskey) return "ok";
  const now = params.now ?? Date.now();
  if (!params.grant) return "passkey_required";
  if (params.grant.userId !== params.actorId) return "passkey_required";
  if (params.grant.sessionId !== params.sessionId) return "passkey_required";
  if (params.grant.expiresAt.getTime() <= now) return "passkey_required";
  return "ok";
}

/**
 * Pure check for whether a challenge row is valid for a given user.
 */
export function evaluateAuthChallenge(params: {
  challengeRow: {
    userId: string;
    challenge: string | null;
    usedAt: Date | null;
    expiresAt: Date;
  } | null;
  actorId?: string;
  now?: number;
}): "ok" | "not_found" | "account_mismatch" | "expired_or_used" {
  if (!params.challengeRow) return "not_found";
  if (params.actorId && params.challengeRow.userId !== params.actorId) return "account_mismatch";
  const now = params.now ?? Date.now();
  if (
    !params.challengeRow.challenge ||
    params.challengeRow.usedAt !== null ||
    params.challengeRow.expiresAt.getTime() <= now
  ) {
    return "expired_or_used";
  }
  return "ok";
}

/**
 * Pure check for whether the browser's device token hash matches the student's
 * 1-to-1 bound device record.
 */
export function evaluateDeviceBinding(params: {
  binding: { userId: string; tokenHash: string } | null;
  actorId: string;
  deviceTokenHash: string | null | undefined;
}): "ok" | "device_mismatch" {
  if (!params.binding || !params.deviceTokenHash) return "device_mismatch";
  if (params.binding.userId !== params.actorId) return "device_mismatch";
  if (!safeEqual(params.binding.tokenHash, params.deviceTokenHash)) return "device_mismatch";
  return "ok";
}

export async function requestGrant(
  actor: Actor,
  opts?: { forceVerify?: boolean },
) {
  assertRole(actor, "student");
  const [{ webauthnConfig }, { db, schema }] = await Promise.all([
    import("../auth"),
    import("../db"),
  ]);
  const { rpID, appUrl, requireCapturePasskey } = webauthnConfig();
  const sessionId = actor.sessionId ?? "ext";

  if (!requireCapturePasskey) {
    return {
      status: "granted" as const,
      expiresAt: new Date(Date.now() + GRANT_TTL_MS).toISOString(),
    };
  }

  // 1. Check if the student has any passkey enrolled.
  const credentials = await db
    .select({
      id: schema.passkeyCredential.id,
      rpId: schema.passkeyCredential.rpId,
    })
    .from(schema.passkeyCredential)
    .where(eq(schema.passkeyCredential.userId, actor.id));

  const validCredentials = credentials.filter((c) => c.rpId === rpID);
  if (validCredentials.length === 0) {
    return {
      status: "needs_enrollment" as const,
      reason: credentials.length > 0 ? ("domain_changed" as const) : ("no_passkey" as const),
      enrollUrl: `${appUrl}/account/security`,
    };
  }

  const [binding] = await db
    .select({ id: schema.deviceBinding.id })
    .from(schema.deviceBinding)
    .where(eq(schema.deviceBinding.userId, actor.id))
    .limit(1);

  if (!binding) {
    return {
      status: "needs_enrollment" as const,
      reason: "device_unbound" as const,
      enrollUrl: `${appUrl}/account/security`,
    };
  }

  // 2. If the caller didn't request a fresh per-tab check, reuse an active grant for this session.
  if (!opts?.forceVerify) {
    const now = new Date();
    const [existingGrant] = await db
      .select()
      .from(schema.captureGrant)
      .where(
        and(
          eq(schema.captureGrant.userId, actor.id),
          eq(schema.captureGrant.sessionId, sessionId),
          gt(schema.captureGrant.expiresAt, now),
        ),
      )
      .orderBy(desc(schema.captureGrant.expiresAt))
      .limit(1);

    if (existingGrant) {
      return {
        status: "granted" as const,
        expiresAt: existingGrant.expiresAt.toISOString(),
      };
    }
  }

  // 3. Create a pending verification request tied to the extension's user + session.
  const requestId = randomUUID();
  const expiresAt = new Date(Date.now() + REQUEST_TTL_MS);

  await db.insert(schema.passkeyChallenge).values({
    id: requestId,
    userId: actor.id,
    sessionId,
    kind: "auth",
    challenge: null,
    expiresAt,
  });

  return {
    status: "pending" as const,
    requestId,
    verifyUrl: `${appUrl}/verify-capture?req=${encodeURIComponent(requestId)}`,
  };
}

export async function getVerifyRequestInfo(
  requestId: string,
  actor: Actor,
  deviceTokenHash?: string | null,
) {
  assertRole(actor, "student");
  if (!requestId) return { state: "not_found" as const };
  const [{ webauthnConfig }, { db, schema }] = await Promise.all([
    import("../auth"),
    import("../db"),
  ]);
  const { rpID } = webauthnConfig();

  const [row] = await db
    .select()
    .from(schema.passkeyChallenge)
    .where(
      and(
        eq(schema.passkeyChallenge.id, requestId),
        eq(schema.passkeyChallenge.kind, "auth"),
      ),
    )
    .limit(1);

  if (!row) return { state: "not_found" as const };
  if (row.userId !== actor.id) {
    return {
      state: "account_mismatch" as const,
      userEmail: actor.email,
      userName: actor.name,
    };
  }
  if (row.usedAt) return { state: "already_verified" as const };
  if (row.expiresAt.getTime() <= Date.now()) return { state: "expired" as const };

  const creds = await db
    .select({ id: schema.passkeyCredential.id })
    .from(schema.passkeyCredential)
    .where(
      and(
        eq(schema.passkeyCredential.userId, row.userId),
        eq(schema.passkeyCredential.rpId, rpID),
      ),
    )
    .limit(1);

  if (creds.length === 0) {
    return {
      state: "needs_enrollment" as const,
      userEmail: actor.email,
      userName: actor.name,
    };
  }

  const [binding] = await db
    .select({ userId: schema.deviceBinding.userId, tokenHash: schema.deviceBinding.tokenHash })
    .from(schema.deviceBinding)
    .where(eq(schema.deviceBinding.userId, actor.id))
    .limit(1);

  if (
    evaluateDeviceBinding({
      binding: binding ?? null,
      actorId: actor.id,
      deviceTokenHash,
    }) !== "ok"
  ) {
    return {
      state: "device_mismatch" as const,
      userEmail: actor.email,
      userName: actor.name,
    };
  }

  return {
    state: "ready" as const,
    requestId: row.id,
    userEmail: actor.email,
    userName: actor.name,
  };
}

export async function authOptions(
  requestId: string,
  actor: Actor,
  deviceTokenHash?: string | null,
) {
  assertRole(actor, "student");
  const [{ webauthnConfig }, { db, schema }] = await Promise.all([
    import("../auth"),
    import("../db"),
  ]);
  const { rpID } = webauthnConfig();

  const [row] = await db
    .select()
    .from(schema.passkeyChallenge)
    .where(
      and(
        eq(schema.passkeyChallenge.id, requestId),
        eq(schema.passkeyChallenge.kind, "auth"),
      ),
    )
    .limit(1);

  const check = evaluateAuthChallenge({
    challengeRow: row ?? null,
    actorId: actor.id,
  });
  if (check === "not_found") throw notFound("Verification request not found.");
  if (check === "account_mismatch") {
    throw forbidden("This verification request belongs to a different Escapture account.");
  }
  if (check === "expired_or_used" || !row) {
    throw badRequest(
      "This verification request has expired. Start capture again from the extension.",
    );
  }

  const [binding] = await db
    .select({ userId: schema.deviceBinding.userId, tokenHash: schema.deviceBinding.tokenHash })
    .from(schema.deviceBinding)
    .where(eq(schema.deviceBinding.userId, actor.id))
    .limit(1);

  if (
    evaluateDeviceBinding({
      binding: binding ?? null,
      actorId: actor.id,
      deviceTokenHash,
    }) !== "ok"
  ) {
    throw forbidden("This browser is not linked to your Escapture account.");
  }

  const credentials = await db
    .select()
    .from(schema.passkeyCredential)
    .where(
      and(
        eq(schema.passkeyCredential.userId, row.userId),
        eq(schema.passkeyCredential.rpId, rpID),
      ),
    );

  if (credentials.length === 0) {
    throw badRequest("No passkey is registered for this account. Set up a passkey first.");
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: credentials.map((c) => ({
      id: c.id,
      transports: ["internal"] as AuthenticatorTransport[],
    })),
  });

  await db
    .update(schema.passkeyChallenge)
    .set({ challenge: options.challenge })
    .where(eq(schema.passkeyChallenge.id, row.id));

  return { options };
}

export async function verifyAuth(input: {
  requestId: string;
  response: AuthenticationResponseJSON;
  actor: Actor;
  deviceTokenHash?: string | null;
}) {
  assertRole(input.actor, "student");
  const [{ webauthnConfig }, { db, schema }] = await Promise.all([
    import("../auth"),
    import("../db"),
  ]);
  const { rpID, origin } = webauthnConfig();

  if (
    input.response.authenticatorAttachment &&
    input.response.authenticatorAttachment !== "platform"
  ) {
    throw badRequest("Only built-in device passkeys are allowed.");
  }

  const [row] = await db
    .select()
    .from(schema.passkeyChallenge)
    .where(
      and(
        eq(schema.passkeyChallenge.id, input.requestId),
        eq(schema.passkeyChallenge.kind, "auth"),
      ),
    )
    .limit(1);

  const check = evaluateAuthChallenge({
    challengeRow: row ?? null,
    actorId: input.actor.id,
  });
  if (check === "not_found") throw notFound("Verification request not found.");
  if (check === "account_mismatch") {
    throw forbidden("This verification request belongs to a different Escapture account.");
  }
  if (check === "expired_or_used" || !row || !row.challenge) {
    throw badRequest(
      "This verification request has expired or was already used. Start capture again from the extension.",
    );
  }

  const [binding] = await db
    .select({ userId: schema.deviceBinding.userId, tokenHash: schema.deviceBinding.tokenHash })
    .from(schema.deviceBinding)
    .where(eq(schema.deviceBinding.userId, input.actor.id))
    .limit(1);

  if (
    evaluateDeviceBinding({
      binding: binding ?? null,
      actorId: input.actor.id,
      deviceTokenHash: input.deviceTokenHash,
    }) !== "ok"
  ) {
    throw forbidden("This browser is not linked to your Escapture account.");
  }

  const [cred] = await db
    .select()
    .from(schema.passkeyCredential)
    .where(
      and(
        eq(schema.passkeyCredential.id, input.response.id),
        eq(schema.passkeyCredential.userId, row.userId),
        eq(schema.passkeyCredential.rpId, rpID),
      ),
    )
    .limit(1);

  if (!cred) {
    throw badRequest("That passkey is not registered for your account.");
  }

  // Mark challenge used before verification to prevent replay attacks.
  await db
    .update(schema.passkeyChallenge)
    .set({ usedAt: new Date() })
    .where(eq(schema.passkeyChallenge.id, row.id));

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: input.response,
      expectedChallenge: row.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: cred.id,
        publicKey: new Uint8Array(Buffer.from(cred.publicKey, "base64url")),
        counter: cred.counter,
        transports: (cred.transports ?? undefined) as AuthenticatorTransport[] | undefined,
      },
      requireUserVerification: true,
    });
  } catch (err) {
    throw badRequest(
      err instanceof Error ? err.message : "Passkey verification failed. Please try again.",
    );
  }

  if (!verification.verified) {
    throw badRequest("Passkey verification failed. Please try again.");
  }

  await db
    .update(schema.passkeyCredential)
    .set({
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    })
    .where(eq(schema.passkeyCredential.id, cred.id));

  const expiresAt = new Date(Date.now() + GRANT_TTL_MS);
  await db.insert(schema.captureGrant).values({
    id: randomUUID(),
    userId: row.userId,
    sessionId: row.sessionId,
    expiresAt,
  });

  return {
    verified: true,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function grantStatus(actor: Actor, requestId: string) {
  assertRole(actor, "student");
  const { db, schema } = await import("../db");

  const [row] = await db
    .select()
    .from(schema.passkeyChallenge)
    .where(
      and(
        eq(schema.passkeyChallenge.id, requestId),
        eq(schema.passkeyChallenge.userId, actor.id),
        eq(schema.passkeyChallenge.kind, "auth"),
      ),
    )
    .limit(1);

  if (!row) throw notFound("Verification request not found.");

  if (row.usedAt) {
    const now = new Date();
    const [grant] = await db
      .select()
      .from(schema.captureGrant)
      .where(
        and(
          eq(schema.captureGrant.userId, actor.id),
          eq(schema.captureGrant.sessionId, row.sessionId),
          gt(schema.captureGrant.expiresAt, now),
        ),
      )
      .orderBy(desc(schema.captureGrant.expiresAt))
      .limit(1);

    if (grant) {
      return {
        status: "granted" as const,
        expiresAt: grant.expiresAt.toISOString(),
      };
    }
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    return { status: "expired" as const };
  }

  return { status: "pending" as const };
}

export async function requireCaptureGrant(actor: Actor) {
  assertRole(actor, "student");
  const [{ webauthnConfig }, { db, schema }] = await Promise.all([
    import("../auth"),
    import("../db"),
  ]);
  const { requireCapturePasskey } = webauthnConfig();
  if (!requireCapturePasskey) return;

  const sessionId = actor.sessionId ?? "ext";
  const now = new Date();
  const [grant] = await db
    .select()
    .from(schema.captureGrant)
    .where(
      and(
        eq(schema.captureGrant.userId, actor.id),
        eq(schema.captureGrant.sessionId, sessionId),
        gt(schema.captureGrant.expiresAt, now),
      ),
    )
    .orderBy(desc(schema.captureGrant.expiresAt))
    .limit(1);

  const decision = evaluateCaptureGrant({
    requireCapturePasskey,
    grant: grant ?? null,
    actorId: actor.id,
    sessionId,
    now: now.getTime(),
  });

  if (decision !== "ok") {
    throw new AppError(
      "passkey_required",
      403,
      "Verify with your passkey before capturing evidence.",
    );
  }
}
