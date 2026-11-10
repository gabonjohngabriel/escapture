import { randomUUID } from "node:crypto";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type AuthenticatorTransport,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { randomToken } from "@/lib/hash";
import { webauthnConfig, type Actor } from "../auth";
import { assertRole } from "../authz";
import { db, schema } from "../db";
import { hashDeviceToken } from "../device-binding";
import { badRequest, conflict, forbidden, notFound } from "../errors";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const FORBIDDEN_TRANSPORTS = new Set(["hybrid", "usb", "ble", "nfc"]);

/**
 * Pure check for whether a newly registered WebAuthn credential satisfies
 * our local platform authenticator policy (blocks phone QR / cross-platform,
 * while allowing synced platform passkeys for hackathon portability).
 */
export function evaluateRegistrationPolicy(params: {
  authenticatorAttachment?: string | null;
  transports?: string[] | null;
}): { ok: true } | { ok: false; reason: string } {
  if (params.authenticatorAttachment !== "platform") {
    return {
      ok: false,
      reason:
        "Only built-in device passkeys (Windows Hello, Touch ID, or Chrome Passkey) are allowed.",
    };
  }
  const transports = params.transports ?? [];
  if (transports.length > 0) {
    if (transports.some((t) => FORBIDDEN_TRANSPORTS.has(t))) {
      return {
        ok: false,
        reason:
          "Phone QR and external security keys are not allowed. Register a passkey on this device.",
      };
    }
    if (!transports.includes("internal")) {
      return {
        ok: false,
        reason: "Only built-in device passkeys are allowed.",
      };
    }
  }
  return { ok: true };
}

export type PasskeyItem = {
  id: string;
  label: string;
  rpId: string;
  transports: string[];
  createdAt: Date;
  lastUsedAt: Date | null;
  rpIdMatches: boolean;
};

export async function listPasskeys(actor: Actor) {
  assertRole(actor, "student");
  const { rpID } = webauthnConfig();
  const rows = await db
    .select()
    .from(schema.passkeyCredential)
    .where(eq(schema.passkeyCredential.userId, actor.id))
    .orderBy(desc(schema.passkeyCredential.createdAt));

  const items: PasskeyItem[] = rows.map((r) => ({
    id: r.id,
    label: r.label,
    rpId: r.rpId,
    transports: r.transports ?? [],
    createdAt: r.createdAt,
    lastUsedAt: r.lastUsedAt,
    rpIdMatches: r.rpId === rpID,
  }));

  const hasValidPasskey = items.some((i) => i.rpIdMatches);
  const hasMismatchedPasskeys = items.some((i) => !i.rpIdMatches);

  const [binding] = await db
    .select({ id: schema.deviceBinding.id })
    .from(schema.deviceBinding)
    .where(eq(schema.deviceBinding.userId, actor.id))
    .limit(1);

  return {
    rpId: rpID,
    items,
    hasValidPasskey,
    hasMismatchedPasskeys,
    hasDeviceBinding: Boolean(binding),
  };
}

export async function registrationOptions(
  actor: Actor,
  currentDeviceTokenHash?: string | null,
) {
  assertRole(actor, "student");
  const { rpName, rpID } = webauthnConfig();

  if (currentDeviceTokenHash) {
    const [existingBrowserBinding] = await db
      .select({ userId: schema.deviceBinding.userId })
      .from(schema.deviceBinding)
      .where(eq(schema.deviceBinding.tokenHash, currentDeviceTokenHash))
      .limit(1);
    if (existingBrowserBinding && existingBrowserBinding.userId !== actor.id) {
      throw forbidden(
        "This browser is already linked to another student account. Ask an administrator to reset the device binding.",
      );
    }
  }

  const existing = await db
    .select({
      id: schema.passkeyCredential.id,
      transports: schema.passkeyCredential.transports,
    })
    .from(schema.passkeyCredential)
    .where(
      and(
        eq(schema.passkeyCredential.userId, actor.id),
        eq(schema.passkeyCredential.rpId, rpID),
      ),
    );

  const [existingUserBinding] = await db
    .select({ id: schema.deviceBinding.id })
    .from(schema.deviceBinding)
    .where(eq(schema.deviceBinding.userId, actor.id))
    .limit(1);

  if (existing.length > 0 || existingUserBinding) {
    throw conflict(
      "You already have a registered passkey and linked device. Ask an administrator to reset your binding before registering again.",
      "passkey_exists",
    );
  }

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new Uint8Array(Buffer.from(actor.id, "utf8")),
    userName: actor.email,
    userDisplayName: actor.name,
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({
      id: c.id,
      transports: (c.transports ?? undefined) as AuthenticatorTransport[] | undefined,
    })),
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "required",
    },
  });

  const challengeId = randomUUID();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await db.insert(schema.passkeyChallenge).values({
    id: challengeId,
    userId: actor.id,
    sessionId: actor.sessionId ?? "web",
    kind: "register",
    challenge: options.challenge,
    expiresAt,
  });

  return { challengeId, options };
}

export async function verifyRegistration(
  actor: Actor,
  input: {
    challengeId: string;
    response: RegistrationResponseJSON;
    label?: string;
  },
  currentDeviceTokenHash?: string | null,
) {
  assertRole(actor, "student");
  const { rpID, origin } = webauthnConfig();

  if (currentDeviceTokenHash) {
    const [existingBrowserBinding] = await db
      .select({ userId: schema.deviceBinding.userId })
      .from(schema.deviceBinding)
      .where(eq(schema.deviceBinding.tokenHash, currentDeviceTokenHash))
      .limit(1);
    if (existingBrowserBinding && existingBrowserBinding.userId !== actor.id) {
      throw forbidden(
        "This browser is already linked to another student account. Ask an administrator to reset the device binding.",
      );
    }
  }

  const policy = evaluateRegistrationPolicy({
    authenticatorAttachment: input.response.authenticatorAttachment,
    transports: input.response.response?.transports,
  });
  if (!policy.ok) {
    throw badRequest(policy.reason);
  }

  const [challengeRow] = await db
    .select()
    .from(schema.passkeyChallenge)
    .where(
      and(
        eq(schema.passkeyChallenge.id, input.challengeId),
        eq(schema.passkeyChallenge.userId, actor.id),
        eq(schema.passkeyChallenge.kind, "register"),
      ),
    )
    .limit(1);

  if (
    !challengeRow ||
    !challengeRow.challenge ||
    challengeRow.usedAt ||
    challengeRow.expiresAt.getTime() <= Date.now()
  ) {
    throw badRequest("That registration session expired. Click 'Add passkey' and try again.");
  }

  // Mark challenge used immediately so it can never be replayed.
  await db
    .update(schema.passkeyChallenge)
    .set({ usedAt: new Date() })
    .where(eq(schema.passkeyChallenge.id, challengeRow.id));

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: input.response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch (err) {
    throw badRequest(
      err instanceof Error ? err.message : "We couldn't verify that passkey. Please try again.",
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    throw badRequest("Passkey verification did not succeed. Please try again.");
  }

  const { credential } = verification.registrationInfo;

  const [alreadyExists] = await db
    .select({ id: schema.passkeyCredential.id })
    .from(schema.passkeyCredential)
    .where(eq(schema.passkeyCredential.id, credential.id))
    .limit(1);

  if (alreadyExists) {
    throw conflict("This passkey is already registered.", "passkey_exists");
  }

  const [alreadyHasPasskey] = await db
    .select({ id: schema.passkeyCredential.id })
    .from(schema.passkeyCredential)
    .where(
      and(
        eq(schema.passkeyCredential.userId, actor.id),
        eq(schema.passkeyCredential.rpId, rpID),
      ),
    )
    .limit(1);

  if (alreadyHasPasskey) {
    throw conflict(
      "You already have a registered passkey. Ask an administrator to reset your binding first.",
      "passkey_exists",
    );
  }

  const cleanLabel = (input.label ?? "").trim().slice(0, 60) || "This Device (Platform Passkey)";
  const publicKeyBase64Url = Buffer.from(credential.publicKey).toString("base64url");
  const rawDeviceToken = randomToken();
  const tokenHash = hashDeviceToken(rawDeviceToken);

  await db.transaction(async (tx) => {
    await tx.insert(schema.passkeyCredential).values({
      id: credential.id,
      userId: actor.id,
      publicKey: publicKeyBase64Url,
      counter: credential.counter,
      transports: credential.transports ?? ["internal"],
      rpId: rpID,
      label: cleanLabel,
    });
    await tx.insert(schema.deviceBinding).values({
      id: randomUUID(),
      userId: actor.id,
      tokenHash,
    });
  });

  return {
    verified: true,
    id: credential.id,
    label: cleanLabel,
    rawDeviceToken,
  };
}

export async function adminResetPasskeys(admin: Actor, studentId: string) {
  assertRole(admin, "admin");

  const [target] = await db
    .select({ id: schema.user.id, role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, studentId))
    .limit(1);

  if (!target || target.role !== "student") {
    throw notFound("Student account not found.");
  }

  await db.delete(schema.passkeyCredential).where(eq(schema.passkeyCredential.userId, studentId));
  await db.delete(schema.passkeyChallenge).where(eq(schema.passkeyChallenge.userId, studentId));
  await db.delete(schema.captureGrant).where(eq(schema.captureGrant.userId, studentId));
  await db.delete(schema.deviceBinding).where(eq(schema.deviceBinding.userId, studentId));

  return { ok: true };
}

export async function listStudentsWithPasskeys(admin: Actor) {
  assertRole(admin, "admin");
  const rows = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      passkeyCount: sql<number>`count(${schema.passkeyCredential.id})::int`,
      lastUsedAt: sql<Date | null>`max(${schema.passkeyCredential.lastUsedAt})`,
    })
    .from(schema.user)
    .leftJoin(schema.passkeyCredential, eq(schema.passkeyCredential.userId, schema.user.id))
    .where(eq(schema.user.role, "student"))
    .groupBy(schema.user.id, schema.user.name, schema.user.email)
    .orderBy(schema.user.name);

  return rows;
}
