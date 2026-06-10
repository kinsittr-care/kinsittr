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
  return (
    <Dialog open={Boolean(message)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="border-[#eadfd3] bg-[#fffdf8] text-[#33271f]"
      >
        <DialogHeader>
          <DialogTitle>Authentication failed</DialogTitle>
          <DialogDescription>
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
