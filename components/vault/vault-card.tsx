import { FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import type { VaultItem } from "./vault-table";

export function VaultCard({
    item,
    shared,
}: {
    item: VaultItem;
    shared: boolean;
}) {
    const isPost = item.kind === "facebook_post";
    const inReports =
        item.caseCount && item.caseCount > 0
            ? item.caseCount === 1
                ? "In a report"
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
            className="group relative flex flex-col overflow-hidden rounded-[24px] border-[2px] border-(--brand-500) bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-(--brand-500)">
            {/* Top Banner */}
            <div className="flex items-center justify-between bg-(--brand-500) px-6 py-4 text-white">
                <div className="flex min-w-0 items-center gap-3.5">
                    <div className="size-10 shrink-0 rounded-full border-2 border-white flex items-center justify-center bg-white/10 text-white font-bold text-md">
                        {/* {item.label ? item.label.slice(0, 1).toUpperCase() : ""} */}
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[18px] font-bold text-white leading-tight">
                            {shared ? "Shared by" : "Group"}
                        </span>
                        <h3 className="truncate text-[14px] font-normal text-white group-hover:underline leading-snug">
                            {item.label || "N/A"}
                        </h3>
                    </div>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-2 px-2 text-[18px] text-white">
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
            <div className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-3 sm:gap-6 bg-white">
                <div>
                    <p className="text-[18px] font-bold text-[#3F7855] leading-tight">
                        Captured
                    </p>
                    <p className="tnum text-[14px] font-normal text-[#3F7855] leading-tight">
                        {formatDateTime(item.capturedAt)}
                    </p>
                </div>

                <div>
                    <p className="text-[18px] font-bold text-[#3F7855] leading-tight">
                        In Reports
                    </p>
                    <p className="truncate text-[14px] font-normal text-[#3F7855] leading-tight">
                        {inReports}
                    </p>
                </div>

                <div>
                    <p className="text-[18px] font-bold text-[#3F7855] leading-tight">
                        Sharing
                    </p>
                    <p className="truncate text-[14px] font-normal text-[#3F7855] leading-tight">
                        {sharingText}
                    </p>
                </div>
            </div>
        </Link>
    );
}
