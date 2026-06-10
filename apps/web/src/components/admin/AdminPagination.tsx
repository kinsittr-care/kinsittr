import { btnGhostCls } from "./compositions/admin-styles";

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
    <div className="flex justify-between items-center gap-3 pt-1">
      <button
        type="button"
        className={btnGhostCls}
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        Previous
      </button>
      <span className="text-[13px] text-admin-ink-soft">
        Page {page} of {totalPages} · {total} total
      </span>
      <button
        type="button"
        className={btnGhostCls}
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        Next
      </button>
    </div>
  );
}
