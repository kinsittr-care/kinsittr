"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminPageHeader from "./AdminPageHeader";
import AdminPill from "./AdminPill";
import { btnDanger, btnGhost, btnPrimary, card } from "./admin-styles";
import { A } from "./tokens";
import type { AdminInviteData, InviteAdminPayload, ListAdminUsersParams } from "@/src/types/api/admin";
import {
  adminUsersQueryKey,
  disableAdmin,
  inviteAdmin,
  listAdminUsers,
} from "@/src/utils/api/admin/management";
import { formatShortDateTime } from "@/src/utils/format";

const PAGE_SIZE = 20;

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: `1.5px solid ${A.border}`,
  borderRadius: 10,
  padding: "11px 13px",
  fontSize: 14,
  outline: "none",
  background: A.card,
  color: A.ink,
};

function fullName(firstname: string, lastname: string) {
  return `${firstname} ${lastname}`.trim() || "Admin";
}

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
  const params = useMemo<ListAdminUsersParams>(() => ({ page, limit: PAGE_SIZE }), [page]);

  const adminsQuery = useQuery({
    queryKey: adminUsersQueryKey(params),
    queryFn: () => listAdminUsers(params),
  });
  const admins = adminsQuery.data?.data?.items ?? [];
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
      <div style={{ padding: "24px 40px 40px", display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: 18 }}>
        <section style={card}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-dm-serif), serif", fontSize: 24, fontWeight: 400, color: A.ink }}>
            Invite admin
          </h2>
          <p style={{ margin: "8px 0 20px", color: A.inkSoft, fontSize: 13.5, lineHeight: 1.6 }}>
            Create an invite token and share the generated acceptance link with the new admin.
          </p>

          <form onSubmit={submitInvite} style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 6, color: A.inkMid, fontSize: 13 }}>
              First name
              <input
                value={draft.firstname}
                onChange={(event) => setDraft((current) => ({ ...current, firstname: event.target.value }))}
                style={inputStyle}
                required
              />
            </label>
            <label style={{ display: "grid", gap: 6, color: A.inkMid, fontSize: 13 }}>
              Last name
              <input
                value={draft.lastname}
                onChange={(event) => setDraft((current) => ({ ...current, lastname: event.target.value }))}
                style={inputStyle}
                required
              />
            </label>
            <label style={{ display: "grid", gap: 6, color: A.inkMid, fontSize: 13 }}>
              Email
              <input
                type="email"
                value={draft.email}
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                style={inputStyle}
                required
              />
            </label>
            <button type="submit" style={btnPrimary} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "Creating invite..." : "Create invite"}
            </button>
          </form>

          {inviteMutation.isError && (
            <p style={{ margin: "14px 0 0", color: A.red, fontSize: 13 }}>
              {inviteMutation.error instanceof Error ? inviteMutation.error.message : "Unable to create invite."}
            </p>
          )}

          {latestInvite && (
            <div style={{ marginTop: 20, border: `1px solid ${A.border}`, borderRadius: 14, padding: 14, background: A.cardWarm }}>
              <div style={{ color: A.ink, fontWeight: 700, fontSize: 14 }}>
                Invite created for {latestInvite.email}
              </div>
              <div style={{ marginTop: 8, color: A.inkSoft, fontSize: 12.5 }}>
                Expires {formatShortDateTime(latestInvite.expires_at)}
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <code style={{ wordBreak: "break-all", color: A.ink, background: A.card, border: `1px solid ${A.border}`, borderRadius: 10, padding: 10, fontSize: 12 }}>
                  {inviteLink(latestInvite)}
                </code>
                <button type="button" style={btnGhost} onClick={copyInvite}>
                  {copied ? "Copied" : "Copy invite link"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: "var(--font-dm-serif), serif", fontSize: 24, fontWeight: 400, color: A.ink }}>
                Admins
              </h2>
              <p style={{ margin: "6px 0 0", color: A.inkSoft, fontSize: 13.5 }}>{total} total admin accounts</p>
            </div>
            <button type="button" style={btnGhost} onClick={() => adminsQuery.refetch()}>
              Refresh
            </button>
          </div>

          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            {adminsQuery.isLoading && <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>Loading admins...</p>}
            {adminsQuery.isError && (
              <p style={{ margin: 0, color: A.red, fontSize: 14 }}>
                {adminsQuery.error instanceof Error ? adminsQuery.error.message : "Unable to load admins."}
              </p>
            )}
            {!adminsQuery.isLoading && !adminsQuery.isError && admins.length === 0 && (
              <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>No admins found.</p>
            )}
            {admins.map((admin) => (
              <div
                key={admin.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  border: `1px solid ${A.borderSoft}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  background: admin.is_active ? A.card : A.cardWarm,
                }}
              >
                <div>
                  <div style={{ color: A.ink, fontWeight: 700 }}>{fullName(admin.firstname, admin.lastname)}</div>
                  <div style={{ color: A.inkSoft, fontSize: 12.5, marginTop: 3 }}>{admin.email}</div>
                  <div style={{ color: A.inkSoft, fontSize: 12, marginTop: 5 }}>
                    Joined {formatShortDateTime(admin.created_at)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AdminPill tone={admin.is_active ? "green" : "red"}>
                    {admin.is_active ? "Active" : "Disabled"}
                  </AdminPill>
                  <button
                    type="button"
                    style={btnDanger}
                    disabled={!admin.is_active || disableMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Disable ${admin.email}? This will revoke their admin access.`)) {
                        disableMutation.mutate(admin.id);
                      }
                    }}
                  >
                    Disable
                  </button>
                </div>
              </div>
            ))}
          </div>

          {disableMutation.isError && (
            <p style={{ margin: "14px 0 0", color: A.red, fontSize: 13 }}>
              {disableMutation.error instanceof Error ? disableMutation.error.message : "Unable to disable admin."}
            </p>
          )}

          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button type="button" style={btnGhost} disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </button>
            <span style={{ color: A.inkSoft, fontSize: 13 }}>
              Page {page} of {totalPages}
            </span>
            <button type="button" style={btnGhost} disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
              Next
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
