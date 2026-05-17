import type { ComponentPropsWithoutRef } from "react";

export type IconProps = ComponentPropsWithoutRef<"svg">;

export interface ColorIconProps extends IconProps {
  color?: string;
}
