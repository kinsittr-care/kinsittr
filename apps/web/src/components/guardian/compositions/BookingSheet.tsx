"use client";

import type { Booking } from "@/src/types/api/api";
import type { Nanny } from "../dashboard/types";
import { useIsMobile } from "../dashboard/useIsMobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
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
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[92dvh] overflow-y-auto p-0"
        >
          <SheetTitle className="sr-only">Book {nanny.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a booking date, time, and duration for this nanny.
          </SheetDescription>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden max-w-[460px]"
      >
        <DialogTitle className="sr-only">
          Book {nanny.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Choose a booking date, time, and duration for this nanny.
        </DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  );
}
