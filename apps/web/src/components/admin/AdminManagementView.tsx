"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminPill from "./compositions/AdminPill";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import { btnDangerCls, btnGhostCls, btnPrimaryCls, cardCls } from "./compositions/admin-styles";
import { cn } from "@/lib/utils";
import type { AdminInviteData, InviteAdminPayload, ListAdminUsersParams } from "@/src/types/api/admin";
import { getCurrentAdminSession } from "@/src/utils/api/admin/auth";
import {
  adminUsersQueryKey,
  disableAdmin,
  inviteAdmin,
  listAdminUsers,
  reactivateAdmin,
} from "@/src/utils/api/admin/management";
import { formatShortDateTime } from "@/src/utils/format";

const PAGE_SIZE = 20;

function inviteLink(invite: AdminInviteData | null) {
  if (!invite?.token || typeof window === "undefined") return invite?.token ?? "";
  return `${window.location.origin}/auth/admin/accept-invite?token=${encodeURIComponent(invite.token)}`;
}

export default function AdminManagementView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<InviteAdminPayload>({ firstname: "", lastname: "", email: "" });
  const [latestInvite, setLatestInvite] = useState<AdminInviteData | null>(null);
  const [copied, setCopied] = useState(false);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const params = useMemo<ListAdminUsersParams>(() => ({ page, limit: PAGE_SIZE }), [page]);

  const currentAdminQuery = useQuery({
    queryKey: ["admin", "auth", "me"],
    queryFn: getCurrentAdminSession,
  });
  const adminsQuery = useQuery({
    queryKey: adminUsersQueryKey(params),
    queryFn: () => listAdminUsers(params),
  });
  const admins = adminsQuery.data?.data?.items ?? [];
  const currentAdminId = currentAdminQuery.data?.data?.user.id;
  const total = adminsQuery.data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const inviteMutation = useMutation({
    mutationFn: inviteAdmin,
    onSuccess: async (response) => {
      setDraft({ firstname: "", lastname: "", email: "" });
      setLatestInvite(response.data ?? null);
      setCopied(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: disableAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
  const reactivateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reactivateAdmin(id, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const submitInvite = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    inviteMutation.mutate({
      firstname: draft.firstname.trim(),
      lastname: draft.lastname.trim(),
      email: draft.email.trim().toLowerCase(),
    });
  };

  const copyInvite = async () => {
    const value = inviteLink(latestInvite);
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
  };

  return (
    <>
      <AdminPageHeader
        title="Admin Management"
        subtitle="Invite admins and manage console access."
      />
      <div className="grid grid-cols-1 gap-[18px] px-4 py-5 md:px-10 md:py-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <section className={cardCls}>
          <h2 className="m-0 font-display text-[24px] font-normal text-admin-ink">
            Invite admin
          </h2>
          <p className="mt-2 mb-5 text-admin-ink-soft text-[13.5px] leading-[1.6]">
            Create an invite token and share the generated acceptance link with the new admin.
            After accepting the invite, they will be redirected to admin sign in because invite acceptance creates
            the admin account but does not issue auth tokens.
          </p>

          <form onSubmit={submitInvite} className="grid gap-[14px]">
            <label className="grid gap-[6px] text-admin-ink-mid text-[13px]">
              First name
              <input
                value={draft.firstname}
                onChange={(event) => setDraft((current) => ({ ...current, firstname: event.target.value }))}
                className="w-full border-[1.5px] border-admin-border rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none bg-admin-card text-admin-ink"
                required
              />
            </label>
            <label className="grid gap-[6px] text-admin-ink-mid text-[13px]">
              Last name
              <input
                value={draft.lastname}
                onChange={(event) => setDraft((current) => ({ ...current, lastname: event.target.value }))}
                className="w-full border-[1.5px] border-admin-border rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none bg-admin-card text-admin-ink"
                required
              />
            </label>
            <label className="grid gap-[6px] text-admin-ink-mid text-[13px]">
              Email
              <input
                type="email"
                value={draft.email}
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                className="w-full border-[1.5px] border-admin-border rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none bg-admin-card text-admin-ink"
                required
              />
            </label>
            <button type="submit" className={btnPrimaryCls} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "Creating invite..." : "Create invite"}
            </button>
          </form>

          {inviteMutation.isError && (
            <p className="mt-[14px] mb-0 text-admin-red text-[13px]">
              {inviteMutation.error instanceof Error ? inviteMutation.error.message : "Unable to create invite."}
            </p>
          )}

          {latestInvite && (
            <div className="mt-5 border border-admin-border rounded-[14px] p-[14px] bg-admin-card-warm">
              <div className="text-admin-ink font-bold text-[14px]">
                Invite created for {latestInvite.email}
              </div>
              <div className="mt-2 text-admin-ink-soft text-[12.5px]">
                Expires {formatShortDateTime(latestInvite.expires_at)}
              </div>
              <div className="mt-3 grid gap-2">
                <code className="break-all text-admin-ink bg-admin-card border border-admin-border rounded-[10px] p-[10px] text-[12px]">
                  {inviteLink(latestInvite)}
                </code>
                <button type="button" className={btnGhostCls} onClick={copyInvite}>
                  {copied ? "Copied" : "Copy invite link"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className={cardCls}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="m-0 font-display text-[24px] font-normal text-admin-ink">
                Admins
              </h2>
              <p className="mt-[6px] mb-0 text-admin-ink-soft text-[13.5px]">{total} total admin accounts</p>
            </div>
            <button type="button" className={btnGhostCls} onClick={() => adminsQuery.refetch()}>
              Refresh
            </button>
          </div>

          <div className="mt-[18px] grid gap-[10px]">
            {adminsQuery.isLoading && <p className="m-0 text-admin-ink-soft text-[14px]">Loading admins...</p>}
            {adminsQuery.isError && (
              <p className="m-0 text-admin-red text-[14px]">
                {adminsQuery.error instanceof Error ? adminsQuery.error.message : "Unable to load admins."}
              </p>
            )}
            {!adminsQuery.isLoading && !adminsQuery.isError && admins.length === 0 && (
              <p className="m-0 text-admin-ink-soft text-[14px]">No admins found.</p>
            )}
            {admins.map((admin) => {
              const isCurrentAdmin = admin.id === currentAdminId;

              return (
                <div
                  className={cn(
                    "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-admin-border-soft rounded-[14px] px-4 py-[14px]",
                    admin.is_active ? "bg-admin-card" : "bg-admin-card-warm",
                  )}
                  key={admin.id}
                >
                  <div className="min-w-0">
                    <div className="text-admin-ink font-bold">{`${admin.firstname} ${admin.lastname}`.trim() || "Admin"}</div>
                    <div className="text-admin-ink-soft text-[12.5px] mt-[3px] overflow-hidden text-ellipsis whitespace-nowrap">{admin.email}</div>
                    <div className="text-admin-ink-soft text-[12px] mt-[5px]">
                      Joined {formatShortDateTime(admin.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <AdminPill tone={admin.is_active ? "green" : "red"}>
                      {admin.is_active ? "Active" : "Disabled"}
                    </AdminPill>
                    {isCurrentAdmin && <AdminPill tone="clay">You</AdminPill>}
                    <button
                      type="button"
                      className={btnDangerCls}
                      disabled={isCurrentAdmin || !admin.is_active || disableMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Disable ${admin.email}? This will revoke their admin access.`)) {
                          disableMutation.mutate(admin.id);
                        }
                      }}
                    >
                      {isCurrentAdmin ? "Current admin" : "Disable"}
                    </button>
                    <button
                      type="button"
                      className={btnPrimaryCls}
                      disabled={admin.is_active || reactivateMutation.isPending}
                      onClick={() => {
                        setReasonAction({
                          title: "Reactivate admin",
                          description: "Restore this admin account. A reason is required for the admin audit trail.",
                          submitLabel: "Reactivate admin",
                          tone: "approve",
                          onSubmit: (reason) => {
                            reactivateMutation.mutate({ id: admin.id, reason });
                            setReasonAction(null);
                          },
                        });
                      }}
                    >
                      Reactivate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {disableMutation.isError && (
            <p className="mt-[14px] mb-0 text-admin-red text-[13px]">
              {disableMutation.error instanceof Error ? disableMutation.error.message : "Unable to disable admin."}
            </p>
          )}
          {reactivateMutation.isError && (
            <p className="mt-[14px] mb-0 text-admin-red text-[13px]">
              {reactivateMutation.error instanceof Error ? reactivateMutation.error.message : "Unable to reactivate admin."}
            </p>
          )}

          <div className="mt-[18px] flex justify-between items-center">
            <button type="button" className={btnGhostCls} disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </button>
            <span className="text-admin-ink-soft text-[13px]">
              Page {page} of {totalPages}
            </span>
            <button type="button" className={btnGhostCls} disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
              Next
            </button>
          </div>
        </section>
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={reactivateMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
