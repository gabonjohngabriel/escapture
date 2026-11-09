import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import type { Actor } from "../auth";
import {
  canConcurResolution,
  canOverseeCase,
  canReferCase,
  canSubmitDirectives,
  canUpdateInvestigationProgress,
  enforce,
  isStaff,
} from "../authz";
import { db } from "../db";
import {
  caseCollaborators,
  caseDirectives,
  caseEvidence,
  caseReferrals,
  cases,
  evidence,
  user,
} from "../db/schema";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import { loadCase } from "./cases";
import { notify } from "./notifications";

export type Agency = "barangay" | "vawc" | "pnp_acg" | "nbi_cybercrime";
export type Severity = "routine" | "moderate" | "severe" | "critical";

export async function createReferral(
  actor: Actor,
  caseId: string,
  input: {
    targetAgency: Agency;
    severity: Severity;
    referralReason: string;
  },
) {
  return db.transaction(async (tx) => {
    const { c, facts } = await loadCase(tx, caseId, { lock: true });
    enforce(canReferCase(actor, facts), "This case cannot be referred.");

    if (!input.referralReason?.trim()) {
      throw badRequest("A reason for referring the case is required.");
    }

    const [referral] = await tx
      .insert(caseReferrals)
      .values({
        caseId: c.id,
        referredBy: actor.id,
        targetAgency: input.targetAgency,
        severity: input.severity,
        referralReason: input.referralReason.trim(),
        status: "referred",
      })
      .returning();

    // Notify authority users belonging to that agency
    const agencyUsers = await tx
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.role, "authority"), eq(user.agency, input.targetAgency)));

    if (agencyUsers.length > 0) {
      await notify(
        tx,
        agencyUsers.map((u) => ({
          userId: u.id,
          type: "case_referred",
          title: `New Case Referral: ${c.title}`,
          body: `Severity: ${input.severity.toUpperCase()}. Reason: ${input.referralReason.slice(0, 100)}...`,
          caseId: c.id,
        })),
      );
    }

    return referral;
  });
}

export async function listReferredCases(
  actor: Actor,
  options?: { agency?: Agency; status?: string; search?: string },
) {
  const agencyFilter =
    actor.role === "authority"
      ? (actor.agency as Agency)
      : options?.agency;

  const conditions = [];
  if (agencyFilter) {
    conditions.push(eq(caseReferrals.targetAgency, agencyFilter));
  }
  if (options?.status) {
    conditions.push(eq(caseReferrals.status, options.status as any));
  }
  if (options?.search?.trim()) {
    conditions.push(ilike(cases.title, `%${options.search.trim()}%`));
  }

  const rows = await db
    .select({
      referralId: caseReferrals.id,
      caseId: cases.id,
      title: cases.title,
      caseStatus: cases.status,
      targetAgency: caseReferrals.targetAgency,
      severity: caseReferrals.severity,
      referralReason: caseReferrals.referralReason,
      referralStatus: caseReferrals.status,
      referredAt: caseReferrals.createdAt,
      updatedAt: caseReferrals.updatedAt,
      referredByName: user.name,
      escalatedAt: cases.escalatedAt,
    })
    .from(caseReferrals)
    .innerJoin(cases, eq(cases.id, caseReferrals.caseId))
    .innerJoin(user, eq(user.id, caseReferrals.referredBy))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(caseReferrals.createdAt));

  const caseIds = rows.map((r) => r.caseId);
  if (!caseIds.length) return [];

  const [evCounts, directiveCounts] = await Promise.all([
    db
      .select({ caseId: caseEvidence.caseId, count: count() })
      .from(caseEvidence)
      .where(and(inArray(caseEvidence.caseId, caseIds), eq(caseEvidence.side, "reporter")))
      .groupBy(caseEvidence.caseId),
    db
      .select({ referralId: caseDirectives.referralId, count: count() })
      .from(caseDirectives)
      .where(inArray(caseDirectives.referralId, rows.map((r) => r.referralId)))
      .groupBy(caseDirectives.referralId),
  ]);

  const evMap = new Map(evCounts.map((e) => [e.caseId, e.count]));
  const dirMap = new Map(directiveCounts.map((d) => [d.referralId, d.count]));

  return rows.map((r) => ({
    ...r,
    evidenceCount: evMap.get(r.caseId) ?? 0,
    directiveCount: dirMap.get(r.referralId) ?? 0,
  }));
}

export async function getOversightCase(actor: Actor, caseId: string) {
  const { c, facts } = await loadCase(db, caseId);

  const referrals = await db
    .select({
      id: caseReferrals.id,
      caseId: caseReferrals.caseId,
      referredBy: caseReferrals.referredBy,
      targetAgency: caseReferrals.targetAgency,
      severity: caseReferrals.severity,
      referralReason: caseReferrals.referralReason,
      status: caseReferrals.status,
      createdAt: caseReferrals.createdAt,
      updatedAt: caseReferrals.updatedAt,
      referredByName: user.name,
      referredByOffice: user.office,
    })
    .from(caseReferrals)
    .innerJoin(user, eq(user.id, caseReferrals.referredBy))
    .where(eq(caseReferrals.caseId, caseId));

  enforce(canOverseeCase(actor, facts, referrals));

  // Load verified sealed evidence packet
  const evidenceRows = await db
    .select({
      id: evidence.id,
      label: evidence.label,
      kind: evidence.kind,
      sourceUrl: evidence.sourceUrl,
      sha256: evidence.sha256,
      byteSize: evidence.byteSize,
      capturedAt: evidence.capturedAt,
      ownerId: evidence.ownerId,
      ownerName: user.name,
    })
    .from(caseEvidence)
    .innerJoin(evidence, eq(evidence.id, caseEvidence.evidenceId))
    .innerJoin(user, eq(user.id, evidence.ownerId))
    .where(and(eq(caseEvidence.caseId, caseId), eq(caseEvidence.side, "reporter")))
    .orderBy(asc(caseEvidence.createdAt));

  // Load all directives / progress logs for this case
  const directives = await db
    .select({
      id: caseDirectives.id,
      referralId: caseDirectives.referralId,
      caseId: caseDirectives.caseId,
      authorId: caseDirectives.authorId,
      authorAgency: caseDirectives.authorAgency,
      actionType: caseDirectives.actionType,
      directives: caseDirectives.directives,
      urgency: caseDirectives.urgency,
      investigationMilestone: caseDirectives.investigationMilestone,
      universityAcknowledgment: caseDirectives.universityAcknowledgment,
      universityRemarks: caseDirectives.universityRemarks,
      concurrence: caseDirectives.concurrence,
      createdAt: caseDirectives.createdAt,
      authorName: user.name,
      authorOffice: user.office,
    })
    .from(caseDirectives)
    .innerJoin(user, eq(user.id, caseDirectives.authorId))
    .where(eq(caseDirectives.caseId, caseId))
    .orderBy(desc(caseDirectives.createdAt));

  return {
    case: {
      id: c.id,
      title: c.title,
      description: c.description,
      status: c.status,
      escalatedAt: c.escalatedAt,
      updatedAt: c.updatedAt,
    },
    referrals,
    evidence: evidenceRows,
    directives,
    userAgency: actor.agency,
  };
}

export async function acceptHandling(actor: Actor, referralId: string) {
  return db.transaction(async (tx) => {
    const [referral] = await tx
      .select()
      .from(caseReferrals)
      .where(eq(caseReferrals.id, referralId))
      .limit(1);

    if (!referral) throw notFound();
    const { facts } = await loadCase(tx, referral.caseId);

    enforce(
      canUpdateInvestigationProgress(actor, facts, referral),
      "You cannot accept external handling for this case.",
    );

    const [updated] = await tx
      .update(caseReferrals)
      .set({
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(caseReferrals.id, referralId))
      .returning();

    // Log directive acknowledging receipt & formal acceptance
    await tx.insert(caseDirectives).values({
      caseId: referral.caseId,
      referralId: referral.id,
      authorId: actor.id,
      authorAgency: referral.targetAgency,
      actionType: "Formal Case Intake & Acceptance",
      directives: `Case accepted for external handling by ${actor.office || actor.agency}. Investigation docket opened.`,
      urgency: referral.severity === "critical" ? "immediate" : "priority",
      investigationMilestone: "Case accepted by authority for formal handling",
      universityAcknowledgment: "acknowledged",
    });

    return updated;
  });
}

export async function submitDirectives(
  actor: Actor,
  referralId: string,
  input: {
    actionType: string;
    directives: string;
    urgency: "standard" | "priority" | "immediate";
    investigationMilestone?: string;
  },
) {
  return db.transaction(async (tx) => {
    const [referral] = await tx
      .select()
      .from(caseReferrals)
      .where(eq(caseReferrals.id, referralId))
      .limit(1);

    if (!referral) throw notFound();
    const { c, facts } = await loadCase(tx, referral.caseId);

    enforce(
      canSubmitDirectives(actor, facts, referral),
      "You do not have permission to submit directives on this case.",
    );

    if (!input.actionType?.trim()) {
      throw badRequest("Action type is required.");
    }
    if (!input.directives?.trim()) {
      throw badRequest("Directives or recommended action details are required.");
    }

    const [directive] = await tx
      .insert(caseDirectives)
      .values({
        caseId: referral.caseId,
        referralId: referral.id,
        authorId: actor.id,
        authorAgency: referral.targetAgency,
        actionType: input.actionType.trim(),
        directives: input.directives.trim(),
        urgency: input.urgency,
        investigationMilestone: input.investigationMilestone?.trim() || null,
        universityAcknowledgment: "pending",
      })
      .returning();

    // Update referral status to investigation_active if milestone given
    if (input.investigationMilestone?.trim()) {
      await tx
        .update(caseReferrals)
        .set({ status: "investigation_active", updatedAt: new Date() })
        .where(eq(caseReferrals.id, referralId));
    }

    // Notify university reviewers on the case
    await notify(tx, [
      {
        userId: referral.referredBy,
        type: "authority_directive",
        title: `Authority Directive: ${input.actionType}`,
        body: `${actor.name} (${referral.targetAgency.toUpperCase()}) submitted action directives for "${c.title}".`,
        caseId: c.id,
      },
    ]);

    return directive;
  });
}

export async function concurResolution(
  actor: Actor,
  referralId: string,
  input: {
    concurrence: boolean;
    remarks: string;
  },
) {
  return db.transaction(async (tx) => {
    const [referral] = await tx
      .select()
      .from(caseReferrals)
      .where(eq(caseReferrals.id, referralId))
      .limit(1);

    if (!referral) throw notFound();
    const { c, facts } = await loadCase(tx, referral.caseId);

    enforce(
      canConcurResolution(actor, facts, referral),
      "You do not have permission to review resolution for this case.",
    );

    const [directive] = await tx
      .insert(caseDirectives)
      .values({
        caseId: referral.caseId,
        referralId: referral.id,
        authorId: actor.id,
        authorAgency: referral.targetAgency,
        actionType: input.concurrence
          ? "Resolution Concurrence & Sign-off"
          : "Resolution Non-Concurrence / Remarks",
        directives: input.remarks.trim() || (input.concurrence ? "Concurred with university resolution." : "Non-concurred."),
        urgency: "standard",
        investigationMilestone: input.concurrence ? "Authority concurrence approved" : "Authority review completed with remarks",
        concurrence: input.concurrence,
        universityAcknowledgment: "acknowledged",
      })
      .returning();

    await tx
      .update(caseReferrals)
      .set({
        status: input.concurrence ? "concurred" : "investigation_active",
        updatedAt: new Date(),
      })
      .where(eq(caseReferrals.id, referralId));

    // Notify reviewer
    await notify(tx, [
      {
        userId: referral.referredBy,
        type: "authority_concurrence",
        title: input.concurrence
          ? `Authority Concurrence Approved: ${c.title}`
          : `Authority Non-Concurrence: ${c.title}`,
        body: `${actor.name} (${referral.targetAgency.toUpperCase()}) recorded final decision review for "${c.title}".`,
        caseId: c.id,
      },
    ]);

    return directive;
  });
}

export async function acknowledgeDirective(
  actor: Actor,
  directiveId: string,
  input: {
    acknowledgment: "adopted" | "acknowledged" | "declined";
    remarks?: string;
  },
) {
  return db.transaction(async (tx) => {
    if (!isStaff(actor)) {
      throw forbidden("Only university staff can acknowledge authority directives.");
    }

    const [directive] = await tx
      .select()
      .from(caseDirectives)
      .where(eq(caseDirectives.id, directiveId))
      .limit(1);

    if (!directive) throw notFound();

    const [updated] = await tx
      .update(caseDirectives)
      .set({
        universityAcknowledgment: input.acknowledgment,
        universityRemarks: input.remarks?.trim() || null,
      })
      .where(eq(caseDirectives.id, directiveId))
      .returning();

    return updated;
  });
}
