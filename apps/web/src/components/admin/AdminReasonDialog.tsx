"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface AdminReasonDialogState {
  title: string;
  description: string;
  submitLabel: string;
  tone?: "danger" | "approve";
  onSubmit: (reason: string) => void;
}

export default function AdminReasonDialog({
  action,
  isSubmitting,
  onClose,
}: {
  action: AdminReasonDialogState | null;
  isSubmitting?: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  if (!action) return null;

  const trimmedReason = reason.trim();
  const canSubmit = trimmedReason.length > 0 && !isSubmitting;
  const close = () => {
    setReason("");
    onClose();
  };
  const submit = () => {
    if (!canSubmit) return;
    action.onSubmit(trimmedReason);
    setReason("");
  };

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-[460px] border-[#e7ddd2] bg-[#fffdf8] p-0 text-[#33271f] shadow-[0_24px_80px_rgba(40,30,20,.22)]">
        <div className="p-[22px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[26px] font-normal text-[#33271f]">
              {action.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#7b7168]">
              {action.description}
            </DialogDescription>
          </DialogHeader>

          <label className="mt-[18px] mb-2 block text-xs font-bold tracking-[.08em] text-[#6f6258] uppercase">
          Reason
          </label>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-[120px] w-full resize-y rounded-xl border-[1.5px] border-[#e7ddd2] bg-[#fbf6ee] px-3.5 py-3 text-sm text-[#33271f] outline-none focus:border-[#8b5e3c]"
            placeholder="Write a clear internal moderation reason..."
            autoFocus
          />
        </div>

        <DialogFooter className="bg-[#fbf6ee]">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action.tone === "approve" ? "outline" : "destructive"}
            className={cn(
              action.tone === "approve" &&
                "border-[color-mix(in_srgb,var(--admin-green)_55%,transparent)] bg-(--admin-green-light) text-(--admin-green) hover:bg-(--admin-green-light)",
            )}
            disabled={!canSubmit}
            onClick={submit}
          >
            {isSubmitting ? "Submitting..." : action.submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
