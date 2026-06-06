"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NannyProfile } from "@/src/types/api/api";
import { deleteNannyAvatar, ownNannyProfileQueryKey, uploadNannyAvatar } from "@/src/utils/api/nanny";
import NannyAvatar from "../NannyAvatar";
import { N } from "../tokens";
import { getInitials } from "./nannyProfileHelpers";

const maxAvatarBytes = 5 * 1024 * 1024;
const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

interface NannyProfileHeaderCardProps {
  profile: NannyProfile;
}

export function NannyProfileHeaderCard({ profile }: NannyProfileHeaderCardProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

  const uploadMutation = useMutation({
    mutationFn: uploadNannyAvatar,
    onMutate: () => {
      setUploadError("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownNannyProfileQueryKey() });
    },
    onError: (error) => {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNannyAvatar,
    onMutate: () => {
      setUploadError("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownNannyProfileQueryKey() });
    },
    onError: (error) => {
      setUploadError(error instanceof Error ? error.message : "Could not remove photo");
    },
  });

  const avatarActionPending = uploadMutation.isPending || deleteMutation.isPending;

  function handleAvatarChange(file: File | undefined) {
    setUploadError("");
    if (!file) return;
    if (!allowedAvatarTypes.has(file.type)) {
      setUploadError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > maxAvatarBytes) {
      setUploadError("Choose an image smaller than 5 MB.");
      return;
    }
    uploadMutation.mutate(file);
  }

  return (
    <div
      className="flex flex-col items-center gap-5 p-5 text-center sm:flex-row sm:gap-6 sm:p-7 sm:text-left"
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        boxShadow: N.shadow,
        marginBottom: 18,
      }}
    >
      <div style={{ position: "relative" }}>
        <NannyAvatar initials={getInitials(profile.display_name)} src={profile.avatar_url || undefined} size={80} tone="green" />
        {profile.verification_status === "verified" && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              background: N.green,
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${N.card}`,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 5.5l2.5 2.5L9 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div style={{ fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 22, color: N.greenDk }}>
          {profile.display_name}
        </div>
        <div
          style={{
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 600,
            color: profile.verification_status === "verified" ? N.green : N.amber,
            background: profile.verification_status === "verified" ? N.greenLt : N.amberLt,
            border: `1px solid ${profile.verification_status === "verified" ? N.greenMid : N.border}`,
            padding: "4px 10px",
            borderRadius: 999,
            textTransform: "capitalize",
          }}
        >
          {profile.verification_status.replaceAll("_", " ")} caregiver
        </div>
      </div>
      <div className="w-full sm:ml-auto sm:w-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            handleAvatarChange(e.target.files?.[0]);
            e.target.value = "";
          }}
          disabled={avatarActionPending}
        />
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            className="w-full sm:w-auto"
            style={{
              padding: "9px 16px",
              background: N.cardSoft,
              border: `1px solid ${N.border}`,
              borderRadius: 10,
              fontSize: 13.5,
              color: avatarActionPending ? N.inkMute : N.greenDk,
              cursor: avatarActionPending ? "not-allowed" : "pointer",
            }}
            disabled={avatarActionPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? "Uploading…" : "Change photo"}
          </button>
          {profile.avatar_url && (
            <button
              className="w-full sm:w-auto"
              style={{
                padding: "9px 16px",
                background: "transparent",
                border: `1px solid ${N.border}`,
                borderRadius: 10,
                fontSize: 13.5,
                color: avatarActionPending ? N.inkMute : "#b42318",
                cursor: avatarActionPending ? "not-allowed" : "pointer",
              }}
              disabled={avatarActionPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Removing…" : "Remove photo"}
            </button>
          )}
        </div>
        {uploadError && (
          <div
            role="alert"
            className="mx-auto sm:mx-0"
            style={{
              marginTop: 8,
              maxWidth: 220,
              fontSize: 12,
              lineHeight: 1.4,
              color: "#b42318",
            }}
          >
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
}
