import { N } from "../tokens";

export default function IdentityTaxCard({
  hasStripeAccount,
  isOnboarded,
}: {
  hasStripeAccount: boolean;
  isOnboarded: boolean;
}) {
  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "24px 28px",
        boxShadow: N.shadow,
      }}
    >
      <h2
        style={{
          fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
          fontSize: 20,
          fontWeight: 400,
          color: N.greenDk,
          marginBottom: 20,
        }}
      >
        Identity &amp; tax details
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoStep label="Identity" status={isOnboarded ? "Complete" : hasStripeAccount ? "In Stripe" : "Not started"} />
        <InfoStep label="Bank details" status={isOnboarded ? "Connected" : hasStripeAccount ? "In Stripe" : "Not started"} />
        <InfoStep label="Tax details" status={isOnboarded ? "Handled" : hasStripeAccount ? "In Stripe" : "Not started"} />
      </div>
      <p style={{ margin: "18px 0 0", fontSize: 13.5, lineHeight: 1.65, color: N.inkMute }}>
        Stripe Express collects and verifies sensitive payout information such as identity, tax, and bank details.
        KinSittr only stores the Stripe connection status needed to send payouts.
      </p>
    </div>
  );
}

function InfoStep({ label, status }: { label: string; status: string }) {
  return (
    <div style={{ border: `1px solid ${N.border}`, borderRadius: 14, background: N.cardSoft, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: N.inkFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 15, color: N.greenDk, fontWeight: 700 }}>{status}</div>
    </div>
  );
}
