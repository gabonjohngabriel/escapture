import { randomUUID } from "node:crypto";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type AuthenticatorTransport,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { webauthnConfig, type Actor } from "../auth";
import { assertRole } from "../authz";
import { db, schema } from "../db";
import { badRequest, conflict, notFound } from "../errors";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

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

  return {
    rpId: rpID,
    items,
    hasValidPasskey,
    hasMismatchedPasskeys,
  };
}

export async function registrationOptions(actor: Actor) {
  assertRole(actor, "student");
  const { rpName, rpID } = webauthnConfig();

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
) {
  assertRole(actor, "student");
  const { rpID, origin } = webauthnConfig();

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

  const cleanLabel = (input.label ?? "").trim().slice(0, 60) || "Passkey";
  const publicKeyBase64Url = Buffer.from(credential.publicKey).toString("base64url");

  await db.insert(schema.passkeyCredential).values({
    id: credential.id,
    userId: actor.id,
    publicKey: publicKeyBase64Url,
    counter: credential.counter,
    transports: credential.transports ?? null,
    rpId: rpID,
    label: cleanLabel,
  });

  return {
    verified: true,
    id: credential.id,
    label: cleanLabel,
  };
}

export async function removePasskey(actor: Actor, credentialId: string) {
  assertRole(actor, "student");
  const { rpID } = webauthnConfig();

  const deleted = await db
    .delete(schema.passkeyCredential)
    .where(
      and(
        eq(schema.passkeyCredential.id, credentialId),
        eq(schema.passkeyCredential.userId, actor.id),
      ),
    )
    .returning({ id: schema.passkeyCredential.id });

  if (deleted.length === 0) {
    throw notFound("Passkey not found.");
  }

  // If the student removed their last passkey for this RP ID, revoke active capture grants.
  const remaining = await db
    .select({ id: schema.passkeyCredential.id })
    .from(schema.passkeyCredential)
    .where(
      and(
        eq(schema.passkeyCredential.userId, actor.id),
        eq(schema.passkeyCredential.rpId, rpID),
      ),
    )
    .limit(1);

  if (remaining.length === 0) {
    await db.delete(schema.captureGrant).where(eq(schema.captureGrant.userId, actor.id));
  }

  return { ok: true };
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
