import type { IconProps } from "./IconTypes";

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
      <path d="M12 2l8 4v7c0 5-4 9-8 11C8 22 4 18 4 13V6l8-4z" stroke="var(--teal)" strokeWidth="2" fill="var(--teal-lt)" />
      <path d="M9 12l2 2 4-4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LocalPinIcon(props: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 21C12 21 4 16 4 9a8 8 0 0 1 16 0c0 7-8 12-8 12z" stroke="var(--gold)" strokeWidth="2" fill="var(--gold-lt)" />
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
      <path d="M10 2C6 2 3 5 3 8c0 5 7 10 7 10s7-5 7-10c0-3-2.5-6-7-6z" stroke="var(--coral)" strokeWidth="1.8" fill="none" />
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
