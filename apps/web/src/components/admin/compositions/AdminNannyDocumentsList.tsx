import { cn } from "@/lib/utils";
import type { AdminNannyDocument } from "@/src/types/api/admin";
import { formatShortDate } from "@/src/utils/format";

export default function AdminNannyDocumentsList({
  documents,
  compact = false,
}: {
  documents: AdminNannyDocument[];
  compact?: boolean;
}) {
  if (documents.length === 0) {
    return (
      <p className={cn("text-admin-ink-soft text-[13px]", compact ? "mt-[10px] mb-0" : "m-0")}>
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col", compact ? "gap-2 mt-3" : "gap-[10px]")}>
      {documents.map((document) => (
        <a
          key={document.id}
          href={document.file_url}
          rel="noreferrer"
          target="_blank"
          className={cn(
            "flex items-center justify-between gap-3 border border-admin-border-soft rounded-[10px] bg-admin-card-warm text-admin-ink no-underline min-w-0",
            compact ? "px-[10px] py-2" : "px-3 py-[10px]",
          )}
        >
          <span className="min-w-0">
            <span className={cn("block overflow-hidden text-ellipsis whitespace-nowrap font-bold", compact ? "text-[12.5px]" : "text-[13.5px]")}>
              {document.file_name}
            </span>
            <span className="block mt-[3px] text-admin-ink-soft text-[11.5px]">
              {formatFileSize(document.size_bytes)} · {formatShortDate(document.created_at)}
            </span>
          </span>
          <span className="text-admin-clay text-[12px] font-bold whitespace-nowrap">
            Open
          </span>
        </a>
      ))}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
