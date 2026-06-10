import { Navbar, Footer } from "@/src/components/landing";
import LegalDoc from "@/src/components/legal/LegalDoc";

export const metadata = { title: "Terms of Service — KinSittr" };

const sections = [
  {
    heading: "Acceptance of terms",
    body: "By creating an account or using KinSittr in any way, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform. These terms apply to all users — parents, nannies, and visitors.",
  },
  {
    heading: "Eligibility",
    body: [
      "You must be at least 18 years old to create an account.",
      "You must provide accurate and truthful information during registration.",
      "Nanny accounts are subject to identity verification and background screening.",
      "One person may not hold more than one account of the same type.",
    ],
  },
  {
    heading: "Platform use",
    body: [
      "KinSittr is a marketplace — we connect families with caregivers but are not a party to any arrangement between them.",
      "You are solely responsible for evaluating the suitability of any caregiver or family you connect with.",
      "You may not use the platform for any unlawful purpose or in a way that violates these terms.",
      "You may not scrape, copy, or reproduce content from KinSittr without written permission.",
      "Impersonation, harassment, or abusive behaviour will result in immediate account suspension.",
    ],
  },
  {
    heading: "Nanny responsibilities",
    body: [
      "You must complete all required verification steps before your profile becomes visible to families.",
      "All information on your profile — experience, qualifications, and availability — must be accurate.",
      "You are an independent contractor, not an employee of KinSittr.",
      "You are responsible for reporting your earnings and complying with applicable tax obligations.",
    ],
  },
  {
    heading: "Parent responsibilities",
    body: [
      "You are responsible for supervising and managing any caregiver you hire through KinSittr.",
      "Payments for services must be made through the platform — off-platform arrangements violate these terms.",
      "You must treat caregivers with respect and in compliance with applicable employment standards.",
      "Providing false reviews or ratings is strictly prohibited.",
    ],
  },
  {
    heading: "Payments and fees",
    body: "KinSittr charges a service fee on each booking, deducted at the time of payment. Fees are shown clearly before you confirm a booking. All payments are processed securely through Stripe. Refunds are subject to the cancellation policy displayed at the time of booking.",
  },
  {
    heading: "Cancellations and refunds",
    body: "Cancellation policies vary by caregiver. The applicable policy will be shown before you confirm a booking. KinSittr's platform fee is non-refundable once a booking is confirmed, except where required by law.",
  },
  {
    heading: "Intellectual property",
    body: "All content on KinSittr — including the logo, design, text, and code — is owned by KinSittr or its licensors and is protected by Canadian copyright law. You may not reproduce or distribute any content without prior written consent.",
  },
  {
    heading: "Disclaimers and limitation of liability",
    body: "KinSittr is provided \"as is\" without warranties of any kind. We do not guarantee the availability, accuracy, or suitability of any caregiver or booking. To the maximum extent permitted by law, KinSittr's liability is limited to the amount of fees you paid in the 12 months preceding the claim.",
  },
  {
    heading: "Termination",
    body: "We reserve the right to suspend or terminate your account at any time if you violate these terms, with or without notice. You may delete your account at any time through your account settings. Sections that by nature survive termination (e.g., intellectual property, limitation of liability) will continue to apply.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes will be resolved exclusively in the courts of Ontario.",
  },
  {
    heading: "Changes to these terms",
    body: "We may update these Terms of Service from time to time. We will provide at least 14 days' notice of material changes via email. Continued use of KinSittr after changes take effect constitutes your acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <LegalDoc
          title="Terms of Service"
          subtitle="Please read these terms carefully before using KinSittr. They govern your access to and use of our platform and services."
          lastUpdated="April 27, 2026"
          sections={sections}
        />
      </main>
      <Footer />
    </>
  );
}
