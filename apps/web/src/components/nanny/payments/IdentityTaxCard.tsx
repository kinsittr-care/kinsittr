export default function IdentityTaxCard({
  hasStripeAccount,
  isOnboarded,
}: {
  hasStripeAccount: boolean;
  isOnboarded: boolean;
}) {
  return (
    <div className="bg-nanny-card border border-nanny-border rounded-[18px] px-7 py-6 shadow-[var(--nanny-shadow)]">
      <h2 className="font-display text-[20px] font-normal text-nanny-green-dk mb-5">
        Identity &amp; tax details
      </h2>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <InfoStep label="Identity" status={isOnboarded ? "Complete" : hasStripeAccount ? "In Stripe" : "Not started"} />
        <InfoStep label="Bank details" status={isOnboarded ? "Connected" : hasStripeAccount ? "In Stripe" : "Not started"} />
        <InfoStep label="Tax details" status={isOnboarded ? "Handled" : hasStripeAccount ? "In Stripe" : "Not started"} />
      </div>
      <p className="mt-[18px] mb-0 text-[13.5px] leading-[1.65] text-nanny-ink-faint">
        Stripe Express collects and verifies sensitive payout information such as identity, tax, and bank details.
        KinSittr only stores the Stripe connection status needed to send payouts.
      </p>
    </div>
  );
}

function InfoStep({ label, status }: { label: string; status: string }) {
  return (
    <div className="border border-nanny-border rounded-[14px] bg-nanny-card-soft px-4 py-[14px]">
      <div className="text-[12px] text-nanny-ink-faint font-bold uppercase tracking-[0.07em]">{label}</div>
      <div className="mt-2 text-[15px] text-nanny-green-dk font-bold">{status}</div>
    </div>
  );
}
