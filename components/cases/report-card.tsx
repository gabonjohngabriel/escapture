import { FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";

export type ReportItem = {
  id: string;
  title: string;
  status: "draft" | "escalated" | "under_review" | "closed";
  role: "owner" | "collaborator";
  ownerName: string;
  evidenceCount: number;
  collaboratorCount: number;
  updatedAt: Date | string;
  kind?: string;
};

/**
 * Report Card matching Figma nodes 44:1090, 44:1290 & 44:1316
 */
export function ReportCard({ item }: { item: ReportItem }) {
  const sharingText =
    item.collaboratorCount > 0
      ? `${item.collaboratorCount} ${item.collaboratorCount === 1 ? "person" : "person"}`
      : "Private";

  const evidenceText = `${item.evidenceCount} ${
    item.evidenceCount === 1 ? "captures" : "captures"
  }`;

  const isMessage = item.title?.toLowerCase().includes("chat") || item.title?.toLowerCase().includes("koopals");

  return (
    <Link
      href={`/cases/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border-[2px] border-[#52946B] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#52946B]"
    >
      {/* Top Banner (Green) */}
      <div className="flex items-center justify-between bg-[#52946B] px-6 py-4.5 text-white">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="size-10 shrink-0 rounded-full border-2 border-white flex items-center justify-center bg-white/10 text-white font-bold text-sm">
            {item.title ? item.title.slice(0, 1).toUpperCase() : ""}
          </div>
          <div className="min-w-0">
            <span className="block text-[14px] font-bold text-white leading-tight">
              Group
            </span>
            <h3 className="truncate text-[18px] font-normal text-white group-hover:underline leading-snug">
              {item.title}
            </h3>
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[15px] font-medium text-white backdrop-blur-xs">
          {isMessage ? (
            <>
              <MessageSquare size={18} strokeWidth={2} aria-hidden className="shrink-0" />
              <span>Messages</span>
            </>
          ) : (
            <>
              <FileText size={18} strokeWidth={2} aria-hidden className="shrink-0" />
              <span>Posts</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Information (White Background, Green Text Columns) */}
      <div className="grid grid-cols-1 gap-4 px-6 py-4.5 sm:grid-cols-3 sm:gap-6 bg-white">
        <div>
          <p className="text-[15px] font-bold text-[#3F7855]">Updated</p>
          <p className="tnum mt-1 text-[15px] font-normal text-[#3F7855]">
            {formatDateTime(item.updatedAt)}
          </p>
        </div>

        <div>
          <p className="text-[15px] font-bold text-[#3F7855]">Evidences</p>
          <p className="mt-1 truncate text-[15px] font-normal text-[#3F7855]">
            {evidenceText}
          </p>
        </div>

        <div>
          <p className="text-[15px] font-bold text-[#3F7855]">Sharing</p>
          <p className="mt-1 truncate text-[15px] font-normal text-[#3F7855]">
            {sharingText}
          </p>
        </div>
      </div>
    </Link>
  );
}
