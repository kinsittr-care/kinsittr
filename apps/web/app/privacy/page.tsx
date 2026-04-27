import { Navbar, Footer } from "@/src/components/landing";
import LegalDoc from "@/src/components/legal/LegalDoc";

export const metadata = { title: "Privacy Policy — KinSittr" };

const sections = [
  {
    heading: "Information we collect",
    body: [
      "Account information: name, email address, password (hashed), phone number, and location (city and province).",
      "Profile information: for parents — number of children and their ages; for nannies — service type, bio, and hourly rate.",
      "Usage data: pages visited, features used, and interactions within the platform.",
      "Communications: messages sent through our contact form or in-app messaging.",
      "Payment information: processed securely through Stripe — we never store full card numbers.",
    ],
  },
  {
    heading: "How we use your information",
    body: [
      "To create and manage your account and profile.",
      "To match families with qualified caregivers in their area.",
      "To send transactional emails such as booking confirmations and account notifications.",
      "To verify caregiver identity and conduct background checks where applicable.",
      "To improve the platform, fix bugs, and develop new features.",
      "To comply with Canadian privacy laws including PIPEDA.",
    ],
  },
  {
    heading: "Sharing your information",
    body: "We do not sell your personal information. We share data only with trusted third-party service providers necessary to operate KinSittr — including Stripe (payments), Resend (transactional email), and our background-check partner. Each provider is contractually bound to handle your data securely and only for the purpose we specify.",
  },
  {
    heading: "Data retention",
    body: "We retain your account data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where we are required by law to retain it longer (e.g., financial records).",
  },
  {
    heading: "Cookies and tracking",
    body: "KinSittr uses essential cookies to keep you signed in and remember your preferences. We do not use third-party advertising trackers. You may disable cookies in your browser settings, though some features may not function correctly without them.",
  },
  {
    heading: "Your rights",
    body: [
      "Access: request a copy of the personal data we hold about you.",
      "Correction: ask us to correct inaccurate or incomplete information.",
      "Deletion: request that we delete your account and associated personal data.",
      "Portability: receive your data in a commonly used, machine-readable format.",
      "Withdrawal of consent: opt out of non-essential communications at any time.",
    ],
  },
  {
    heading: "Children's privacy",
    body: "KinSittr is intended for adults (18+). We do not knowingly collect personal information from children. Child ages provided during parent registration are used solely for matching purposes and are not attributed to the children directly.",
  },
  {
    heading: "Security",
    body: "We use industry-standard measures including HTTPS encryption, hashed passwords (bcrypt), and access controls to protect your data. No system is perfectly secure — please use a strong, unique password and notify us immediately if you suspect unauthorised access to your account.",
  },
  {
    heading: "Changes to this policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on the platform. Continued use of KinSittr after changes take effect constitutes acceptance of the updated policy.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <LegalDoc
          title="Privacy Policy"
          subtitle="KinSittr is committed to protecting your privacy. This policy explains what personal information we collect, how we use it, and your rights under Canadian privacy law."
          lastUpdated="April 27, 2026"
          sections={sections}
        />
      </main>
      <Footer />
    </>
  );
}
