"use client";

import type { Booking } from "@/src/types/api/api";
import type { Nanny } from "../dashboard/types";
import { useIsMobile } from "../dashboard/useIsMobile";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import BookingFormContent from "../dashboard/BookingFormContent";

interface BookingSheetProps {
  nanny: Nanny | null;
  open: boolean;
  onClose: () => void;
  onBooked: (booking: Booking) => void;
}

export default function BookingSheet({ nanny, open, onClose, onBooked }: BookingSheetProps) {
  const isMobile = useIsMobile();

  if (!nanny) return null;

  const content = <BookingFormContent nanny={nanny} onClose={onClose} onBooked={onBooked} />;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[92dvh] overflow-y-auto">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden max-w-[460px]"
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}
