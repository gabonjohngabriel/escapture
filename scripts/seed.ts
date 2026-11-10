// pnpm db:seed — idempotent demo data.
import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { allowedEmailDomain } from "@/lib/email-domain";
import { sha256Hex } from "@/lib/hash";
import type { Actor } from "@/server/auth";
import { db, pg } from "@/server/db";
import {
    caseDirectives,
    caseReferrals,
    cases,
    evidence,
} from "@/server/db/schema";
import {
    addCollaborator,
    attachEvidence,
    createCase,
    escalate,
    escalationPreview,
} from "@/server/services/cases";
import { createEvidence, renameEvidence } from "@/server/services/evidence";
import { assignReviewer, setUnderReview } from "@/server/services/review";
import { ensureBucket, storageDriver } from "@/server/storage";
import { ensureUser } from "./lib/users";

const PASSWORD = process.env.SEED_PASSWORD ?? "Escapture-demo-2026";
const DOMAIN = allowedEmailDomain();

const report = {
    checks: [
        { id: "design-mode", passed: true },
        { id: "contenteditable", passed: true },
        { id: "userscript-markers", passed: true },
        { id: "injected-elements", passed: true },
    ],
    allPassed: true,
    extensionVersion: "seed",
};

async function capture(
    actor: Actor,
    fixture: string,
    kind: "facebook_post" | "facebook_message",
    sourceUrl: string,
) {
    // Same code path as a real upload: real bytes, real SHA-256, same storage.
    const bytes = new Uint8Array(await readFile(`fixtures/${fixture}`));
    return createEvidence(actor, {
        bytes,
        sha256: sha256Hex(bytes),
        kind,
        sourceUrl,
        clientCapturedAt: new Date().toISOString(),
        tamperReport: report,
        extensionVersion: "seed",
    });
}

function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function captureScreenshotAsHtml(
    actor: Actor,
    pngFixture: string,
    label: string,
    title: string,
    sourceUrl: string,
) {
    const pngBytes = await readFile(`fixtures/${pngFixture}`);
    const b64 = pngBytes.toString("base64");
    const safeTitle = escapeHtml(title);
    const safeUrl = escapeHtml(sourceUrl);
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>
      body { margin: 0; padding: 16px; background: #18191a; color: #e4e6eb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .card { max-width: 960px; margin: 0 auto; background: #242526; border: 1px solid #3a3b3c; border-radius: 10px; overflow: hidden; }
      .meta { padding: 10px 14px; border-bottom: 1px solid #3a3b3c; font-size: 12px; color: #b0b3b8; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
      .shot { display: block; width: 100%; height: auto; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="meta">
        <span><strong>${safeTitle}</strong></span>
        <span>Source: ${safeUrl}</span>
      </div>
      <img class="shot" alt="${safeTitle}" src="data:image/png;base64,${b64}" />
    </div>
  </body>
</html>`;
    const bytes = new Uint8Array(Buffer.from(html, "utf-8"));
    const ev = await createEvidence(actor, {
        bytes,
        sha256: sha256Hex(bytes),
        kind: "facebook_post",
        sourceUrl,
        clientCapturedAt: new Date().toISOString(),
        tamperReport: report,
        extensionVersion: "seed",
    });
    return renameEvidence(actor, ev.id, label);
}

async function main() {
    await ensureBucket();
    console.log(`Storage: ${storageDriver()}`);

    const accounts = {
        admin: await ensureUser({
            email: "admin@safetrail.test",
            name: "Demo Admin",
            password: PASSWORD,
            role: "admin",
        }),
        reviewer1: await ensureUser({
            email: "reviewer1@safetrail.test",
            name: "Reviewer One",
            password: PASSWORD,
            role: "reviewer",
        }),
        reviewer2: await ensureUser({
            email: "reviewer2@safetrail.test",
            name: "Reviewer Two",
            password: PASSWORD,
            role: "reviewer",
        }),
        maya: await ensureUser({
            email: `maya.demo@${DOMAIN}`,
            name: "Maya Santos",
            password: PASSWORD,
            role: "student",
        }),
        juan: await ensureUser({
            email: `juandelacruz@${DOMAIN}`,
            name: "Juan Dela Cruz",
            password: PASSWORD,
            role: "student",
        }),
        jules: await ensureUser({
            email: `jules.demo@${DOMAIN}`,
            name: "Jules Reyes",
            password: PASSWORD,
            role: "student",
        }),
        alex: await ensureUser({
            email: `alex.demo@${DOMAIN}`,
            name: "Alex Cruz",
            password: PASSWORD,
            role: "student",
        }),
        vawc: await ensureUser({
            email: "ravenbituin@guinhawa.gov.ph",
            name: "Raven Bituin",
            password: PASSWORD,
            role: "authority",
            agency: "vawc",
            office: "Barangay Guinhawa VAWC Desk",
            badgeOrCredentials: "VAWC-OFFICER-2026-004",
        }),
        pnp: await ensureUser({
            email: "nico.agustin@acg.pnp.gov.ph",
            name: "Nico Angelo Agustin",
            password: PASSWORD,
            role: "authority",
            agency: "pnp_acg",
            office: "PNP Anti-Cybercrime Group",
            badgeOrCredentials: "PNP-ACG-88492",
        }),
        nbi: await ensureUser({
            email: "rafael.perez@nbi.gov.ph",
            name: "Rafael Perez",
            password: PASSWORD,
            role: "authority",
            agency: "nbi_cybercrime",
            office: "NBI Cybercrime Division Group",
            badgeOrCredentials: "NBI-CCD-0428",
        }),
    };
    const maya: Actor = accounts.maya;
    const jules: Actor = accounts.jules;
    const alex: Actor = accounts.alex;
    const juan: Actor = accounts.juan;

    const [existing] = await db
        .select({ id: evidence.id })
        .from(evidence)
        .where(eq(evidence.ownerId, maya.id))
        .limit(1);
    const [existingCase] = await db
        .select({ id: cases.id })
        .from(cases)
        .where(eq(cases.ownerId, maya.id))
        .limit(1);
    if (existing || existingCase) {
        console.log("Demo evidence and cases already exist. Skipping them.");
        if (existingCase) {
            const [existingRef] = await db
                .select({ id: caseReferrals.id })
                .from(caseReferrals)
                .where(eq(caseReferrals.caseId, existingCase.id))
                .limit(1);
            if (!existingRef) {
                const [ref] = await db
                    .insert(caseReferrals)
                    .values({
                        caseId: existingCase.id,
                        referredBy: accounts.reviewer1.id,
                        targetAgency: "pnp_acg",
                        severity: "severe",
                        referralReason:
                            "Targeted online harassment and defamatory statements against student, continuing in off-campus chat threads. Requires cyber investigation.",
                        status: "investigation_active",
                    })
                    .returning();

                await db.insert(caseDirectives).values({
                    caseId: existingCase.id,
                    referralId: ref.id,
                    authorId: accounts.pnp.id,
                    authorAgency: "pnp_acg",
                    actionType: "PNP Blotter & Digital Preservation",
                    directives:
                        "Incident recorded in PNP Blotter #2026-BUL-088. Evidence hash verified. Preservation notice issued under Sec. 13 of RA 10175.",
                    urgency: "priority",
                    investigationMilestone:
                        "Docket #2026-BUL-088 opened. Digital preservation requested.",
                    universityAcknowledgment: "adopted",
                    universityRemarks:
                        "Guidance Office in coordination with BulSU Legal acknowledging PNP docket.",
                });
                console.log(
                    "Attached sample severe referral and directive to existing case.",
                );
            }
        }
    } else {
        const post = await capture(
            maya,
            "fake-facebook-post.html",
            "facebook_post",
            "https://www.facebook.com/sample.classmate/posts/1000001",
        );
        const chat = await capture(
            maya,
            "fake-messenger.html",
            "facebook_message",
            "https://www.messenger.com/t/1000002",
        );
        const julesChat = await capture(
            jules,
            "fake-messenger.html",
            "facebook_message",
            "https://www.messenger.com/t/1000003",
        );
        await capture(
            alex,
            "fake-facebook-post.html",
            "facebook_post",
            "https://www.facebook.com/sample.classmate/posts/1000004",
        );

        // One escalated case: Maya owns it, Jules is a collaborator.
        const escalated = await createCase(maya, {
            title: "Posts and messages about the group project",
            description:
                "A classmate posted about me after our quiz and then messaged me about the group project. Jules was in the same group and saw the messages too.",
        });
        await attachEvidence(maya, escalated.id, [post.id]);
        await addCollaborator(maya, escalated.id, jules.email);
        await attachEvidence(jules, escalated.id, [julesChat.id]);
        const preview = await escalationPreview(maya, escalated.id);
        await escalate(maya, escalated.id, preview.digest);

        // One private draft.
        const draft = await createCase(maya, {
            title: "Messages from last night",
            description: "Still deciding whether to report this.",
        });
        await attachEvidence(maya, draft.id, [chat.id]);
        console.log("Created demo evidence, one escalated case and one draft.");

        // Create sample referral to PNP ACG for the severe case
        const [ref] = await db
            .insert(caseReferrals)
            .values({
                caseId: escalated.id,
                referredBy: accounts.reviewer1.id,
                targetAgency: "pnp_acg",
                severity: "severe",
                referralReason:
                    "Targeted online harassment and defamatory statements against student, continuing in off-campus chat threads. Requires cyber investigation.",
                status: "investigation_active",
            })
            .returning();

        await db.insert(caseDirectives).values({
            caseId: escalated.id,
            referralId: ref.id,
            authorId: accounts.pnp.id,
            authorAgency: "pnp_acg",
            actionType: "PNP Blotter & Digital Preservation",
            directives:
                "Incident recorded in PNP Blotter #2026-BUL-088. Evidence hash verified. Preservation notice issued under Sec. 13 of RA 10175.",
            urgency: "priority",
            investigationMilestone:
                "Docket #2026-BUL-088 opened. Digital preservation requested.",
            universityAcknowledgment: "adopted",
            universityRemarks:
                "Guidance Office in coordination with BulSU Legal acknowledging PNP docket.",
        });
        console.log("Created sample severe referral and directive to PNP ACG.");
    }

    const [existingJuanEv] = await db
        .select({ id: evidence.id })
        .from(evidence)
        .where(eq(evidence.ownerId, juan.id))
        .limit(1);
    const [existingJuanCase] = await db
        .select({ id: cases.id })
        .from(cases)
        .where(eq(cases.ownerId, juan.id))
        .limit(1);

    if (existingJuanEv || existingJuanCase) {
        console.log("Juan's cyberbullying evidence and cases already exist. Skipping them.");
    } else {
        const evShaming = await captureScreenshotAsHtml(
            juan,
            "evidence-sample-1.png",
            "Facebook Post: Giyu Ginanon public shaming post",
            "Facebook Post by Giyu Ginanon (Oct 23, 9:20 AM)",
            "https://www.facebook.com/photo/?fbid=1128592906847255&set=pob.100090896690529",
        );
        const evGate1Threat = await captureScreenshotAsHtml(
            juan,
            "evidence-sample-2.png",
            "Facebook Post: BulSU Gate 1 threat photo & comment",
            "Facebook Photo Post by Giyu Ginanon (Oct 14, 8:55 PM)",
            "https://www.facebook.com/photo/?fbid=1128592906847255&set=pob.100090896690529",
        );

        // Case 1: Escalated, flagged, assigned to Reviewer One, Under Review, and referred to NBI Cybercrime.
        const gate1Case = await createCase(juan, {
            title: "Targeted Cyberbullying & Gate 1 Threat by Giyu Ginanon",
            description:
                "Giyu Ginanon posted a candid campus photo of us on Facebook and threatened a physical confrontation outside BulSU Gate 1 ('pagala-gala pa kayo, mga panget naman kau!! maghanda kayu sa gate 1 ng bulsu, may hinanda ako para sainyu'), while James Natividad commented 'bulsu suntukan' encouraging violence.",
        });
        await attachEvidence(juan, gate1Case.id, [evGate1Threat.id]);
        const gate1Preview = await escalationPreview(juan, gate1Case.id);
        await escalate(juan, gate1Case.id, gate1Preview.digest);
        await assignReviewer(accounts.admin, gate1Case.id, accounts.reviewer1.id);
        await setUnderReview(accounts.reviewer1, gate1Case.id);

        const [nbiRef] = await db
            .insert(caseReferrals)
            .values({
                caseId: gate1Case.id,
                referredBy: accounts.reviewer1.id,
                targetAgency: "nbi_cybercrime",
                severity: "severe",
                referralReason:
                    "Public cyberbullying photo post containing explicit intimidation and physical threat ('maghanda kayu sa gate 1 ng bulsu, may hinanda ako para sainyu' / 'bulsu suntukan') targeting BulSU students.",
                status: "accepted",
            })
            .returning();

        await db.insert(caseDirectives).values({
            caseId: gate1Case.id,
            referralId: nbiRef.id,
            authorId: accounts.nbi.id,
            authorAgency: "nbi_cybercrime",
            actionType: "Formal Case Intake & Cyber Harassment Preservation",
            directives:
                "Case accepted by NBI Cybercrime Division Group. Preserve Facebook post metadata and monitor campus Gate 1 threat actors in coordination with BulSU Security.",
            urgency: "priority",
            investigationMilestone: "NBI Cybercrime intake accepted; preservation request logged.",
            universityAcknowledgment: "acknowledged",
            universityRemarks: "BulSU Office of Student Affairs and campus security notified.",
        });

        // Case 2: Draft in Juan's account for live escalation demonstration.
        const shamingDraft = await createCase(juan, {
            title: "Public Shaming Post Targeting Former Friends (Giyu Ginanon)",
            description:
                "Giyu Ginanon published a mocking Facebook callout targeting former classmates who started a family before graduating ('couldnt fucking belive na you'll sacrifice your studies just for that?'). Preparing evidence for campus anti-cyberbullying review.",
        });
        await attachEvidence(juan, shamingDraft.id, [evShaming.id]);

        console.log("Created Juan Dela Cruz's cyberbullying evidence, under-review NBI case, and draft case.");
    }

    console.log("\nDemo accounts (password for all: " + PASSWORD + ")");
    for (const a of Object.values(accounts))
        console.log(`  ${a.role.padEnd(8)} ${a.email}`);
    await pg.end();
}

main().catch(async (e) => {
    console.error(e);
    await pg.end().catch(() => {});
    process.exit(1);
});
