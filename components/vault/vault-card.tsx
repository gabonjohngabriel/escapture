import { FileCheck2, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { VaultItem } from "./vault-table";

export function VaultCard({
    item,
    shared,
    sensitive = false,
}: {
    item: VaultItem;
    shared: boolean;
    sensitive?: boolean;
}) {
    const isPost = item.kind === "facebook_post";
    const inReports =
        item.caseCount && item.caseCount > 0
            ? item.caseCount === 1
                ? "In 1 report"
                : `In ${item.caseCount} reports`
            : "Not in a report";

    const sharingText = shared
        ? `From ${item.ownerName}`
        : item.shareCount && item.shareCount > 0
          ? `${item.shareCount} ${item.shareCount === 1 ? "person" : "people"}`
          : item.linkCount && item.linkCount > 0
            ? "Password link"
            : "Private";

    return (
        <Link
            href={`/vault/${item.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-500 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-500">
            {/* Top Banner */}
            <div className="flex items-center justify-between bg-brand-500 px-6 py-4 text-white">
                <div className="flex min-w-0 items-center gap-3.5">
                    <UserAvatar
                        seed={item.ownerName || item.id}
                        size={40}
                        title={item.ownerName || "You"}
                        className="border-2 border-white/60 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                        <span className="block text-xs font-regular text-white/80 leading-tight">
                            {shared
                                ? `Shared by ${item.ownerName}`
                                : "Captured by you"}
                        </span>
                        <h3
                            data-privacy-sensitive={sensitive ? "true" : undefined}
                            className="truncate text-[16px] font-bold text-white group-hover:underline tracking-tight leading-snug">
                            {item.label || "Untitled capture"}
                        </h3>
                    </div>
                </div>

                <div className="ml-2 flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[16px] font-medium text-white backdrop-blur-xs">
                    {isPost ? (
                        <>
                            <div className="inline-flex items-center justify-center bg-white/5 rounded-xl p-2 backdrop-blur-xs">
                                <FileText
                                    size={24}
                                    strokeWidth={2}
                                    aria-hidden
                                />
                            </div>
                            <span>Posts</span>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center bg-white/5 rounded-xl p-2 backdrop-blur-xs">
                                <MessageSquare
                                    size={24}
                                    strokeWidth={2}
                                    aria-hidden
                                />
                            </div>
                            <span>Messages</span>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Information */}
            <div className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4 sm:gap-4 bg-card border-t border-border/40">
                <div>
                    <p className="text-xs font-bold text-muted">
                        Captured
                    </p>
                    <p className="tnum mt-0.5 text-sm font-semibold text-ink leading-tight">
                        {formatDateTime(item.capturedAt)}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-bold text-muted">
                        In reports
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink leading-tight">
                        {inReports}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-bold text-muted">
                        Sharing
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink leading-tight">
                        {sharingText}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-bold text-muted">
                        Integrity
                    </p>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-tamper-fg">
                        <FileCheck2 size={14} strokeWidth={2} aria-hidden />
                        Tamper-checked
                    </span>
                </div>
            </div>
        </Link>
    );
}
