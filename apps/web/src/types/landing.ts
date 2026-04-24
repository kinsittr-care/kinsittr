import type { ReactNode } from "react";

export type AudienceCardVariant = "families" | "nannies";

export interface AudienceCardContent {
  tag: string;
  heading: ReactNode;
  body: string;
  perks: string[];
  cta: string;
}

export interface AudienceCardProps {
  variant: AudienceCardVariant;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface HeroFeature {
  label: string;
  icon: ReactNode;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface LogoProps {
  dark?: boolean;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface RevealWrapperProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export interface SafetyBadgeItem {
  label: string;
  icon: ReactNode;
}

export interface SafetyBadgeProps {
  icon: ReactNode;
  label: string;
}

export interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}
