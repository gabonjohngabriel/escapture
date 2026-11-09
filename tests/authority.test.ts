import { describe, expect, it } from "vitest";
import * as authz from "@/server/authz";

const student = { id: "maya", role: "student" as const };
const reviewer = { id: "rev", role: "reviewer" as const };
const admin = { id: "adm", role: "admin" as const };

const pnpOfficer: authz.AuthorityActor = {
  id: "pnp1",
  role: "authority",
  agency: "pnp_acg",
};

const vawcOfficer: authz.AuthorityActor = {
  id: "vawc1",
  role: "authority",
  agency: "vawc",
};

const rogueAuthority: authz.AuthorityActor = {
  id: "rogue",
  role: "authority",
  agency: null,
};

const openCase = { status: "under_review" as const };
const escalatedCase = { status: "escalated" as const };
const closedCase = { status: "closed" as const };
const draftCase = { status: "draft" as const };

const pnpReferral = {
  targetAgency: "pnp_acg",
  severity: "severe" as const,
  status: "referred",
};

const vawcRoutineReferral = {
  targetAgency: "vawc",
  severity: "routine" as const,
  status: "referred",
};

describe("Authority Role Boundaries (Separation of Concerns)", () => {
  it("authorities cannot assign reviewers to cases", () => {
    expect(authz.canAssignReviewer(pnpOfficer, escalatedCase)).toBe("forbidden");
    expect(authz.canAssignReviewer(vawcOfficer, openCase)).toBe("forbidden");
  });

  it("authorities cannot provision reviewer accounts", () => {
    expect(authz.canProvisionReviewer(pnpOfficer)).toBe("forbidden");
    expect(authz.canProvisionReviewer(vawcOfficer)).toBe("forbidden");
  });

  it("authorities cannot manage the word bank", () => {
    expect(authz.canManageWordBank(pnpOfficer)).toBe("forbidden");
    expect(authz.canManageWordBank(vawcOfficer)).toBe("forbidden");
  });
});

describe("University Case Referral", () => {
  it("staff can refer open cases to external authorities", () => {
    expect(authz.canReferCase(reviewer, escalatedCase)).toBe("ok");
    expect(authz.canReferCase(admin, openCase)).toBe("ok");
    expect(authz.canReferCase(reviewer, closedCase)).toBe("locked");
    expect(authz.canReferCase(reviewer, draftCase)).toBe("not_found");
  });

  it("students and authorities cannot refer cases", () => {
    expect(authz.canReferCase(student, escalatedCase)).toBe("forbidden");
    expect(authz.canReferCase(pnpOfficer, escalatedCase)).toBe("forbidden");
  });
});

describe("Case Oversight & Least Privilege", () => {
  it("authorities can oversee cases referred to their agency", () => {
    expect(authz.canOverseeCase(pnpOfficer, escalatedCase, [pnpReferral])).toBe("ok");
    expect(authz.canOverseeCase(vawcOfficer, openCase, [vawcRoutineReferral])).toBe("ok");
  });

  it("authorities get not_found for cases not referred to their agency", () => {
    expect(authz.canOverseeCase(vawcOfficer, escalatedCase, [pnpReferral])).toBe("not_found");
    expect(authz.canOverseeCase(pnpOfficer, openCase, [vawcRoutineReferral])).toBe("not_found");
  });

  it("authorities cannot see student drafts even if matching agency", () => {
    expect(authz.canOverseeCase(pnpOfficer, draftCase, [pnpReferral])).toBe("not_found");
  });

  it("authorities without agency set are forbidden", () => {
    expect(authz.canOverseeCase(rogueAuthority, escalatedCase, [pnpReferral])).toBe("forbidden");
  });

  it("university staff can oversee any non-draft case referrals", () => {
    expect(authz.canOverseeCase(reviewer, escalatedCase, [pnpReferral])).toBe("ok");
    expect(authz.canOverseeCase(admin, openCase, [vawcRoutineReferral])).toBe("ok");
  });
});

describe("Action Directives & Advisories", () => {
  it("authorities can submit action directives for cases referred to their agency", () => {
    expect(authz.canSubmitDirectives(pnpOfficer, escalatedCase, pnpReferral)).toBe("ok");
    expect(authz.canSubmitDirectives(vawcOfficer, openCase, vawcRoutineReferral)).toBe("ok");
  });

  it("authorities cannot submit directives for cases referred to another agency", () => {
    expect(authz.canSubmitDirectives(vawcOfficer, escalatedCase, pnpReferral)).toBe("forbidden");
  });

  it("directives are locked when the case is closed", () => {
    expect(authz.canSubmitDirectives(pnpOfficer, closedCase, pnpReferral)).toBe("locked");
  });
});

describe("Severe Case External Handling Progress", () => {
  it("authorities can log investigation progress for severe or critical cases", () => {
    expect(authz.canUpdateInvestigationProgress(pnpOfficer, escalatedCase, pnpReferral)).toBe("ok");
    expect(
      authz.canUpdateInvestigationProgress(pnpOfficer, escalatedCase, {
        ...pnpReferral,
        severity: "critical",
      }),
    ).toBe("ok");
  });

  it("authorities cannot log investigation progress for routine or moderate referrals", () => {
    expect(
      authz.canUpdateInvestigationProgress(vawcOfficer, openCase, vawcRoutineReferral),
    ).toBe("forbidden");
    expect(
      authz.canUpdateInvestigationProgress(pnpOfficer, escalatedCase, {
        ...pnpReferral,
        severity: "moderate",
      }),
    ).toBe("forbidden");
  });
});

describe("Final Decision Review & Concurrence", () => {
  it("authorities can review and concur with resolution on cases referred to them", () => {
    expect(authz.canConcurResolution(pnpOfficer, openCase, pnpReferral)).toBe("ok");
    expect(authz.canConcurResolution(vawcOfficer, openCase, vawcRoutineReferral)).toBe("ok");
  });

  it("authorities cannot concur for cases referred to another agency", () => {
    expect(authz.canConcurResolution(vawcOfficer, openCase, pnpReferral)).toBe("forbidden");
  });
});
