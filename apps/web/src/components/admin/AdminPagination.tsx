import { btnGhost } from "./admin-styles";
import { A } from "./tokens";

export default function AdminPagination({
  page,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        paddingTop: 4,
      }}
    >
      <button
        type="button"
        style={btnGhost}
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        Previous
      </button>
      <span style={{ color: A.inkSoft, fontSize: 13 }}>
        Page {page} of {totalPages} · {total} total
      </span>
      <button
        type="button"
        style={btnGhost}
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        Next
      </button>
    </div>
  );
}
