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
import { createEvidence } from "@/server/services/evidence";
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
