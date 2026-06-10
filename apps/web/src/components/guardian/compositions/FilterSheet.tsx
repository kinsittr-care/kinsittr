"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  children: ReactNode;
}

export default function FilterSheet({ open, onClose, resultCount, children }: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[88dvh] gap-0 p-0"
      >
        <SheetHeader className="text-left px-5 pt-5 pb-0">
          <SheetTitle className="font-display text-[22px] font-normal">Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Refine nanny search results by availability, location, experience, and other filters.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
          {children}
        </div>

        <SheetFooter className="px-5 pt-0 pb-6">
          <button
            onClick={onClose}
            className="btn-cta w-full justify-center p-[13px] text-[15px]"
          >
            Show {resultCount} {resultCount === 1 ? "nanny" : "nannies"}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
