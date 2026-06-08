import type { PaymentStatus } from "@/src/types/api/api";
import { formatPaymentState, type PaymentStateTone } from "@/src/utils/format";

const styles: Record<PaymentStateTone, React.CSSProperties> = {
  neutral: {
    background: "#f0ede8",
    color: "#000",
    border: "1px solid var(--border)",
  },
  warning: {
    background: "#fff7df",
    color: "#8f6b00",
    border: "1px solid #eed787",
  },
  success: {
    background: "#edf3ec",
    color: "#557a50",
    border: "1px solid #cbdcc7",
  },
  danger: {
    background: "#f7eceb",
    color: "#a84b43",
    border: "1px solid #e7c7c3",
  },
};

export default function PaymentStatusBadge({ status }: { status?: PaymentStatus | "" }) {
  const state = formatPaymentState(status);

  return (
    <span
      style={{
        fontSize: 11.5,
        padding: "3px 9px",
        borderRadius: 20,
        fontWeight: 500,
        ...styles[state.tone],
      }}
    >
      {state.label}
    </span>
  );
}
