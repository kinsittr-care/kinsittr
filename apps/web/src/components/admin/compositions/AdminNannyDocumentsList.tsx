import type { AdminNannyDocument } from "@/src/types/api/admin";
import { formatShortDate } from "@/src/utils/format";
import { A } from "../tokens";

export default function AdminNannyDocumentsList({
  documents,
  compact = false,
}: {
  documents: AdminNannyDocument[];
  compact?: boolean;
}) {
  if (documents.length === 0) {
    return (
      <p style={{ margin: compact ? "10px 0 0" : 0, color: A.inkSoft, fontSize: 13 }}>
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 10, marginTop: compact ? 12 : 0 }}>
      {documents.map((document) => (
        <a
          key={document.id}
          href={document.file_url}
          rel="noreferrer"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: compact ? "8px 10px" : "10px 12px",
            border: `1px solid ${A.borderSoft}`,
            borderRadius: 10,
            background: A.cardWarm,
            color: A.ink,
            textDecoration: "none",
            minWidth: 0,
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span
              style={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: compact ? 12.5 : 13.5,
                fontWeight: 700,
              }}
            >
              {document.file_name}
            </span>
            <span style={{ display: "block", marginTop: 3, color: A.inkSoft, fontSize: 11.5 }}>
              {formatFileSize(document.size_bytes)} · {formatShortDate(document.created_at)}
            </span>
          </span>
          <span style={{ color: A.clay, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
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
