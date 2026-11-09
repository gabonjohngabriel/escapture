import { notFound } from "next/navigation";
import { CaseOversightView } from "@/components/authority/case-oversight-view";
import { requireUser } from "@/server/auth";
import { getOversightCase } from "@/server/services/authority";

export default async function AuthorityCaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await requireUser({ roles: ["authority", "reviewer", "admin"] });

    let data;
    try {
        data = await getOversightCase(user, id);
    } catch (e: any) {
        if (e.status === 404 || e.code === "not_found") {
            notFound();
        }
        throw e;
    }

    return (
        <CaseOversightView
            caseId={id}
            initialData={{
                case: {
                    ...data.case,
                    escalatedAt: data.case.escalatedAt ? data.case.escalatedAt.toISOString() : null,
                    updatedAt: data.case.updatedAt.toISOString(),
                },
                referrals: data.referrals.map((r) => ({
                    ...r,
                    createdAt: r.createdAt.toISOString(),
                    updatedAt: r.updatedAt.toISOString(),
                })),
                evidence: data.evidence.map((e) => ({
                    ...e,
                    capturedAt: e.capturedAt.toISOString(),
                })),
                directives: data.directives.map((d) => ({
                    ...d,
                    createdAt: d.createdAt.toISOString(),
                })),
                userAgency: data.userAgency,
            }}
        />
    );
}
