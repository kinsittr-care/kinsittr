import AdminAvatar from "./AdminAvatar";
import AdminPill from "./AdminPill";
import { btnDangerCls } from "./admin-styles";
import { cn } from "@/lib/utils";
import type { AdminParent } from "@/src/types/api/admin";
import { formatLocation } from "@/src/utils/format";

function initialsFor(parent: AdminParent) {
  const source = `${parent.user_firstname[0] ?? ""}${parent.user_lastname[0] ?? ""}`;
  return source.toUpperCase() || parent.display_name.slice(0, 2).toUpperCase() || "PA";
}

type AdminParentsTableProps = {
  busyIds: Set<string>;
  isLoading: boolean;
  parents: AdminParent[];
  selectedParentId: string | null;
  onSelect: (id: string) => void;
  onSuspend: (parent: AdminParent) => void;
};

export default function AdminParentsTable({
  busyIds,
  isLoading,
  parents,
  selectedParentId,
  onSelect,
  onSuspend,
}: AdminParentsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-[var(--admin-shadow)]">
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-admin-divider bg-admin-card-warm text-[11.5px] font-semibold uppercase tracking-[.14em] text-admin-ink-soft">
            <tr>
              <th className="px-6 py-[14px]">Parent</th>
              <th className="px-6 py-[14px]">City</th>
              <th className="px-6 py-[14px]">Children</th>
              <th className="px-6 py-[14px]">Bookings</th>
              <th className="px-6 py-[14px]">Status</th>
              <th className="px-6 py-[14px] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-6 text-admin-ink-soft" colSpan={6}>Loading parents...</td></tr>
            ) : parents.length === 0 ? (
              <tr><td className="p-6 text-admin-ink-soft" colSpan={6}>No parents found.</td></tr>
            ) : (
              parents.map((parent, index) => (
                <ParentTableRow
                  key={parent.id}
                  isBusy={busyIds.has(parent.id)}
                  parent={parent}
                  selected={selectedParentId === parent.id}
                  showBorder={index < parents.length - 1}
                  onSelect={onSelect}
                  onSuspend={onSuspend}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 p-2 xl:hidden">
        {isLoading ? (
          <div className="p-6 text-admin-ink-soft">Loading parents...</div>
        ) : parents.length === 0 ? (
          <div className="p-6 text-admin-ink-soft">No parents found.</div>
        ) : (
          parents.map((parent) => (
            <ParentCard
              key={parent.id}
              isBusy={busyIds.has(parent.id)}
              parent={parent}
              selected={selectedParentId === parent.id}
              onSelect={onSelect}
              onSuspend={onSuspend}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ParentIdentity({ parent }: { parent: AdminParent }) {
  return (
    <div className="flex min-w-0 items-center gap-[14px]">
      <AdminAvatar initials={initialsFor(parent)} size={40} tone={parent.user_is_active ? "clay" : "muted"} />
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold text-admin-ink">{parent.display_name}</div>
        <div className="truncate text-[12.5px] text-admin-ink-soft">{parent.user_email}</div>
      </div>
    </div>
  );
}

function ParentStatus({ parent }: { parent: AdminParent }) {
  return (
    <AdminPill tone={parent.user_is_active ? "green" : "red"}>
      {parent.user_is_active ? "active" : "suspended"}
    </AdminPill>
  );
}

function SuspendButton({
  isBusy,
  parent,
  onSuspend,
}: {
  isBusy: boolean;
  parent: AdminParent;
  onSuspend: (parent: AdminParent) => void;
}) {
  return (
    <button
      disabled={!parent.user_is_active || isBusy}
      onClick={() => onSuspend(parent)}
      className={cn(btnDangerCls, (!parent.user_is_active || isBusy) && "opacity-55")}
    >
      Suspend
    </button>
  );
}

function ParentTableRow({
  isBusy,
  parent,
  selected,
  showBorder,
  onSelect,
  onSuspend,
}: {
  isBusy: boolean;
  parent: AdminParent;
  selected: boolean;
  showBorder: boolean;
  onSelect: (id: string) => void;
  onSuspend: (parent: AdminParent) => void;
}) {
  return (
    <tr
      className="admin-table-row cursor-pointer transition-colors duration-150"
      style={{
        background: selected ? "var(--admin-card-warm)" : "transparent",
        borderBottom: showBorder ? "1px solid var(--admin-border-soft)" : "none",
      }}
      onClick={() => onSelect(parent.id)}
    >
      <td className="px-6 py-4"><ParentIdentity parent={parent} /></td>
      <td className="px-6 py-4 text-[14px] text-admin-ink-mid">{formatLocation(parent.city, parent.province, "not set")}</td>
      <td className="px-6 py-4 text-[14px] text-admin-ink-mid">{parent.num_children}</td>
      <td className="px-6 py-4 text-[14px] text-admin-ink-mid">{parent.booking_count}</td>
      <td className="px-6 py-4"><ParentStatus parent={parent} /></td>
      <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
        <SuspendButton isBusy={isBusy} parent={parent} onSuspend={onSuspend} />
      </td>
    </tr>
  );
}

function ParentCard({
  isBusy,
  parent,
  selected,
  onSelect,
  onSuspend,
}: {
  isBusy: boolean;
  parent: AdminParent;
  selected: boolean;
  onSelect: (id: string) => void;
  onSuspend: (parent: AdminParent) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="admin-table-row block w-full cursor-pointer overflow-hidden rounded-xl border border-admin-border-soft px-4 py-4 text-left transition-colors duration-150 sm:px-6"
      style={{
        background: selected ? "var(--admin-card-warm)" : "transparent",
      }}
      onClick={() => onSelect(parent.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(parent.id);
        }
      }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <ParentIdentity parent={parent} />
        <div className="shrink-0">
          <ParentStatus parent={parent} />
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-[13.5px] text-admin-ink-mid sm:grid-cols-3">
        <Meta label="Location" value={formatLocation(parent.city, parent.province, "not set")} />
        <Meta label="Children" value={String(parent.num_children)} />
        <Meta label="Bookings" value={String(parent.booking_count)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-admin-border-soft pt-3" onClick={(event) => event.stopPropagation()}>
        <SuspendButton isBusy={isBusy} parent={parent} onSuspend={onSuspend} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-admin-ink-soft">{label}</div>
      <div className="mt-1 text-admin-ink-mid">{value}</div>
    </div>
  );
}
