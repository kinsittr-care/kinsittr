"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AuthErrorDialog({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const titleID = "auth-error-dialog-title";
  const descriptionID = "auth-error-dialog-description";

  return (
    <Dialog open={Boolean(message)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={descriptionID}
        aria-labelledby={titleID}
        className="border-[#eadfd3] bg-[#fffdf8] text-[#33271f]"
      >
        <DialogHeader>
          <DialogTitle id={titleID}>Authentication failed</DialogTitle>
          <DialogDescription id={descriptionID}>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Try again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
