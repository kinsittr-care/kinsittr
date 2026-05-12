import type { ReactNode } from "react";

export default function SectionCard({
  title,
  titleAction,
  children,
}: {
  title: string;
  titleAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fdfaf5",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(40,30,20,.07)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3"
        style={{ marginBottom: 18 }}
      >
        <h3
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--faint)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          {title}
        </h3>
        {titleAction}
      </div>
      {children}
    </div>
  );
}
