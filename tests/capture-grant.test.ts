import { describe, expect, it } from "vitest";
import {
  evaluateAuthChallenge,
  evaluateCaptureGrant,
  GRANT_TTL_MS,
} from "../server/services/capture-grant";

describe("capture grant evaluation", () => {
  const now = 1_760_000_000_000;

  it("allows capture when a valid grant exists for the user and session", () => {
    const decision = evaluateCaptureGrant({
      requireCapturePasskey: true,
      grant: {
        userId: "student-1",
        sessionId: "session-abc",
        expiresAt: new Date(now + GRANT_TTL_MS),
      },
      actorId: "student-1",
      sessionId: "session-abc",
      now,
    });
    expect(decision).toBe("ok");
  });

  it("rejects capture when no grant exists", () => {
    const decision = evaluateCaptureGrant({
      requireCapturePasskey: true,
      grant: null,
      actorId: "student-1",
      sessionId: "session-abc",
      now,
    });
    expect(decision).toBe("passkey_required");
  });

  it("rejects capture when the grant has expired", () => {
    const decision = evaluateCaptureGrant({
      requireCapturePasskey: true,
      grant: {
        userId: "student-1",
        sessionId: "session-abc",
        expiresAt: new Date(now - 1),
      },
      actorId: "student-1",
      sessionId: "session-abc",
      now,
    });
    expect(decision).toBe("passkey_required");
  });

  it("rejects capture when the grant belongs to a different extension session", () => {
    const decision = evaluateCaptureGrant({
      requireCapturePasskey: true,
      grant: {
        userId: "student-1",
        sessionId: "session-other",
        expiresAt: new Date(now + GRANT_TTL_MS),
      },
      actorId: "student-1",
      sessionId: "session-abc",
      now,
    });
    expect(decision).toBe("passkey_required");
  });

  it("rejects capture when the grant belongs to a different user", () => {
    const decision = evaluateCaptureGrant({
      requireCapturePasskey: true,
      grant: {
        userId: "student-2",
        sessionId: "session-abc",
        expiresAt: new Date(now + GRANT_TTL_MS),
      },
      actorId: "student-1",
      sessionId: "session-abc",
      now,
    });
    expect(decision).toBe("passkey_required");
  });

  it("allows capture when REQUIRE_CAPTURE_PASSKEY is disabled", () => {
    const decision = evaluateCaptureGrant({
      requireCapturePasskey: false,
      grant: null,
      actorId: "student-1",
      sessionId: "session-abc",
      now,
    });
    expect(decision).toBe("ok");
  });
});

describe("passkey auth challenge evaluation", () => {
  const now = 1_760_000_000_000;

  it("accepts an unused, unexpired challenge for the same student", () => {
    const res = evaluateAuthChallenge({
      challengeRow: {
        userId: "student-1",
        challenge: "random-base64url-challenge",
        usedAt: null,
        expiresAt: new Date(now + 60_000),
      },
      actorId: "student-1",
      now,
    });
    expect(res).toBe("ok");
  });

  it("returns account_mismatch when web tab is signed in as another user", () => {
    const res = evaluateAuthChallenge({
      challengeRow: {
        userId: "student-1",
        challenge: "random-base64url-challenge",
        usedAt: null,
        expiresAt: new Date(now + 60_000),
      },
      actorId: "student-2",
      now,
    });
    expect(res).toBe("account_mismatch");
  });

  it("rejects an already-used challenge (replay protection)", () => {
    const res = evaluateAuthChallenge({
      challengeRow: {
        userId: "student-1",
        challenge: "random-base64url-challenge",
        usedAt: new Date(now - 5_000),
        expiresAt: new Date(now + 60_000),
      },
      actorId: "student-1",
      now,
    });
    expect(res).toBe("expired_or_used");
  });

  it("rejects an expired challenge", () => {
    const res = evaluateAuthChallenge({
      challengeRow: {
        userId: "student-1",
        challenge: "random-base64url-challenge",
        usedAt: null,
        expiresAt: new Date(now - 1),
      },
      actorId: "student-1",
      now,
    });
    expect(res).toBe("expired_or_used");
  });
});
