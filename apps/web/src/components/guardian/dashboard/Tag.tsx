import { cn } from "@/lib/utils";

type TagVariant = "default" | "accent" | "green";

interface TagProps {
  label: string;
  variant?: TagVariant;
}

const variantCls: Record<TagVariant, string> = {
  default: "bg-white border-brand-border text-[#555]",
  accent:  "bg-gold-lt border-[#e8d090] text-[#8a6e20]",
  green:   "bg-teal-lt border-teal-mid text-teal",
};

export default function Tag({ label, variant = "default" }: TagProps) {
  return (
    <span className={cn("border rounded-[20px] px-[11px] py-[3px] text-[12px] font-medium whitespace-nowrap", variantCls[variant])}>
      {label}
    </span>
  );
}
