"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  children: ReactNode;
}

export default function FilterDrawer({ open, onClose, resultCount, children }: FilterDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[88dvh]">
        <DrawerHeader className="text-left px-5 pt-2 pb-0">
          <DrawerTitle className="font-display text-[22px] font-normal">Filters</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
          {children}
        </div>

        <DrawerFooter className="px-5 pt-0 pb-6">
          <button
            onClick={onClose}
            className="btn-cta w-full justify-center"
            style={{ padding: "13px", fontSize: 15 }}
          >
            Show {resultCount} {resultCount === 1 ? "nanny" : "nannies"}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
