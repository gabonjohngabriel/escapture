import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { UserAvatar } from "@/components/ui/user-avatar";

export type ReportItem = {
    id: string;
    title: string;
    status: "draft" | "escalated" | "under_review" | "closed";
    role: "owner" | "collaborator";
    ownerName: string;
    evidenceCount: number;
    collaboratorCount: number;
    updatedAt: Date | string;
};

/**
 * Report Card
 */
export function ReportCard({
    item,
    sensitive = false,
}: {
    item: ReportItem;
    sensitive?: boolean;
}) {
    const sharingText =
        item.collaboratorCount > 0
            ? `${item.collaboratorCount} ${item.collaboratorCount === 1 ? "collaborator" : "collaborators"}`
            : "Private";

    const evidenceText = `${item.evidenceCount} ${
        item.evidenceCount === 1 ? "capture" : "captures"
    }`;

    return (
        <Link
            href={`/cases/${item.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-500 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-500">
            {/* Top Banner */}
            <div className="flex items-center justify-between bg-brand-500 px-6 py-4 text-white">
                <div className="flex min-w-0 items-center gap-3.5">
                    <UserAvatar
                        seed={item.ownerName || item.id}
                        size={40}
                        title={item.ownerName || "Reporter"}
                        className="border-2 border-white/60 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                        <span className="block text-xs font-semibold text-white/80 leading-tight">
                            {item.role === "owner"
                                ? "Your report"
                                : `Shared by ${item.ownerName}`}
                        </span>
                        <h3
                            data-privacy-sensitive={sensitive ? "true" : undefined}
                            className="truncate text-base font-bold text-white group-hover:underline leading-snug">
                            {item.title}
                        </h3>
                    </div>
                </div>

                <div className="ml-3 shrink-0">
                    <StatusBadge status={item.status} />
                </div>
            </div>

            {/* Bottom Information */}
            <div className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-3 sm:gap-6 bg-card border-t border-border/40">
                <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider">
                        Updated
                    </p>
                    <p className="tnum mt-0.5 text-sm font-semibold text-ink leading-tight">
                        {formatDateTime(item.updatedAt)}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider">
                        Evidence
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink leading-tight">
                        {evidenceText}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider">
                        Sharing
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink leading-tight">
                        {sharingText}
                    </p>
                </div>
            </div>
        </Link>
    );
}
