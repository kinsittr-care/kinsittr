import type { ComponentPropsWithoutRef } from "react";

type IconProps = ComponentPropsWithoutRef<"svg">;

interface ColorIconProps extends IconProps {
  color?: string;
}

export function SparkleIcon({
  color = "currentColor",
  ...props
}: ColorIconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 2l2.8 8.6H23l-7.4 5.4 2.8 8.6L12 19.2l-6.4 5.4 2.8-8.6L1 10.6h8.2z"
        fill={color}
      />
    </svg>
  );
}

export function ArrowRightIcon({
  color = "currentColor",
  ...props
}: ColorIconProps) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2 7.5h11M8 3l4.5 4.5L8 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VerifiedCircleIcon({
  color = "currentColor",
  ...props
}: ColorIconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1z"
        stroke={color}
        strokeWidth="1.4"
      />
      <path
        d="M5 7l1.5 1.5L9 5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({
  color = "currentColor",
  ...props
}: ColorIconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="1"
        y="4"
        width="12"
        height="9"
        rx="2"
        stroke={color}
        strokeWidth="1.4"
      />
      <path
        d="M9 4V3a2 2 0 0 0-4 0v1"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon({
  color = "currentColor",
  ...props
}: ColorIconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path d="M2 7h10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 2v10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BrandMarkIcon(props: IconProps) {
  return (
    <svg
      width={16}
      height={18}
      viewBox="0 0 16 18"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M8 1C5 1 2 4.5 2 7.5c0 5 6 9.5 6 9.5s6-4.5 6-9.5C14 4.5 11 1 8 1z"
        fill="white"
        opacity=".9"
      />
      <circle cx="8" cy="7.5" r="2.2" fill="#3a5a5a" />
    </svg>
  );
}

export function AudienceCheckIcon({
  color = "currentColor",
  ...props
}: ColorIconProps) {
  return (
    <svg
      width={10}
      height={8}
      viewBox="0 0 10 8"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1 4l3 3 5-5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TinyCheckIcon({
  color = "currentColor",
  ...props
}: ColorIconProps) {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchStepIcon(props: IconProps) {
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" fill="none" aria-hidden="true" {...props}>
      <circle cx="22" cy="22" r="22" fill="var(--teal-lt)" />
      <circle cx="20" cy="20" r="8" stroke="var(--teal)" strokeWidth="2" />
      <path d="M26 26l5 5" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarStepIcon(props: IconProps) {
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" fill="none" aria-hidden="true" {...props}>
      <circle cx="22" cy="22" r="22" fill="var(--gold-lt)" />
      <rect x="12" y="13" width="20" height="18" rx="3" stroke="var(--gold)" strokeWidth="2" />
      <path d="M12 19h20" stroke="var(--gold)" strokeWidth="1.5" />
      <path d="M17 26h10" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChatStepIcon(props: IconProps) {
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" fill="none" aria-hidden="true" {...props}>
      <circle cx="22" cy="22" r="22" fill="#fdecea" />
      <path d="M31 26a11 11 0 0 1-18 0" stroke="var(--coral)" strokeWidth="2" fill="none" />
      <path d="M13 26V14a9 9 0 0 1 18 0v12" stroke="var(--coral)" strokeWidth="2" />
      <circle cx="22" cy="28" r="2" fill="var(--coral)" />
    </svg>
  );
}

export function BackgroundCheckIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 1l7 3v6c0 4.4-3 8.3-7 9.4C6 18.3 3 14.4 3 10V4l7-3z"
        stroke="rgba(255,255,255,.7)"
        strokeWidth="1.5"
        fill="rgba(255,255,255,.1)"
      />
      <path
        d="M7 10l2 2 4-4"
        stroke="rgba(255,255,255,.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReferenceVerifiedIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="7" r="4" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" />
      <path
        d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="rgba(255,255,255,.7)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InterviewScreenedIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="5" width="16" height="12" rx="2.5" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" />
      <path d="M6 5V4a4 4 0 0 1 8 0v1" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PaymentsIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="11" width="16" height="10" rx="2.5" stroke="var(--teal)" strokeWidth="1.8" />
      <path d="M7 11V7a4 4 0 0 1 8 0v4" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function StandoutProfileIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <path
        d="M11 2l2.5 6H20l-5 4 2 6.5L11 15l-6 3.5 2-6.5L2 8h6.5L11 2z"
        stroke="var(--gold)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ScheduleTermsIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="16" height="15" rx="2.5" stroke="var(--coral)" strokeWidth="1.8" />
      <path d="M7 2v4M15 2v4M3 9h16" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function FlexibleClockIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="8" stroke="var(--sage)" strokeWidth="1.8" />
      <path d="M11 7v4.5l3 2" stroke="var(--sage)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ContractDocumentIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <rect x="4" y="2" width="14" height="18" rx="2.5" stroke="var(--teal)" strokeWidth="1.8" />
      <path d="M8 8h6M8 12h6M8 16h4" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CommunitySupportIcon(props: IconProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="8" r="4" stroke="var(--gold)" strokeWidth="1.8" />
      <path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TrustFirstIcon(props: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2l8 4v7c0 5-4 9-8 11C8 22 4 18 4 13V6l8-4z"
        stroke="var(--teal)"
        strokeWidth="2"
        fill="var(--teal-lt)"
      />
      <path d="M9 12l2 2 4-4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LocalPinIcon(props: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21C12 21 4 16 4 9a8 8 0 0 1 16 0c0 7-8 12-8 12z"
        stroke="var(--gold)"
        strokeWidth="2"
        fill="var(--gold-lt)"
      />
      <circle cx="12" cy="9" r="3" fill="var(--gold)" />
    </svg>
  );
}

export function BothSidesIcon(props: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="8" r="3" stroke="var(--coral)" strokeWidth="2" />
      <circle cx="15" cy="8" r="3" stroke="var(--coral)" strokeWidth="2" />
      <path d="M3 20c0-4 2.7-7 6-7h6c3.3 0 6 3 6 7" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SimpleClockIcon(props: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="var(--sage)" strokeWidth="2" />
      <path d="M12 8v4l3 3" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="4" width="16" height="13" rx="2.5" stroke="var(--teal)" strokeWidth="1.8" />
      <path d="M2 7l8 5 8-5" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 2C6 2 3 5 3 8c0 5 7 10 7 10s7-5 7-10c0-3-2.5-6-7-6z"
        stroke="var(--coral)"
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="10" cy="8" r="2.5" fill="var(--coral)" />
    </svg>
  );
}

export function TrustSignalShieldIcon(props: IconProps) {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" fill="none" aria-hidden="true" {...props}>
      <path d="M13 2.5L21 6V12Q21 19 13 22.5Q5 19 5 12V6Z" stroke="var(--teal)" strokeWidth="1.8" fill="none" />
      <path d="M9 13l3 3 5-6" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IdentityConfirmedIcon(props: IconProps) {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" fill="none" aria-hidden="true" {...props}>
      <circle cx="13" cy="9" r="4.5" stroke="var(--gold)" strokeWidth="1.8" />
      <path d="M4 22c0-4.5 4-8 9-8s9 3.5 9 8" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 7l2 2" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="19" cy="7" r="2.5" fill="var(--gold)" opacity=".6" />
    </svg>
  );
}

export function MonitoringIcon(props: IconProps) {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" fill="none" aria-hidden="true" {...props}>
      <circle cx="13" cy="13" r="9" stroke="var(--coral)" strokeWidth="1.8" />
      <path d="M13 9v5l3 2" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 6l3 3M20 6l-3 3" stroke="var(--coral)" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

export function SafetyShieldCheckIcon(props: IconProps) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path d="M9 1.5L15.5 4.5V9Q15.5 14 9 16.5Q2.5 14 2.5 9V4.5Z" stroke="var(--teal-mid)" strokeWidth="1.5" fill="none" />
      <path d="M6 9l2 2 4-4" stroke="var(--teal-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VerificationShieldCheckIcon(props: IconProps) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden="true" {...props}>
      <path d="M7 1L12 3.5V7Q12 11 7 13Q2 11 2 7V3.5Z" stroke="#7a6018" strokeWidth="1.3" fill="none" />
      <path d="M4.5 7l2 2 3-3" stroke="#7a6018" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChecklistCheckIcon(props: IconProps) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M3 8l3.5 3.5L13 4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
