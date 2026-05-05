import Avatar from "../Avatar";
import SectionCard from "./SectionCard";

const CHILDREN = [
  { name: "Alex", age: "6 yrs" },
  { name: "Sam", age: "3 yrs" },
];

const childCardStyle: React.CSSProperties = {
  background: "var(--teal-lt)",
  border: "1px solid var(--teal-mid)",
  borderRadius: 10,
  padding: "8px 14px",
};

export default function ChildrenSection() {
  return (
    <SectionCard title="Children">
      <div className="flex gap-[10px] flex-wrap" style={{ marginBottom: 14 }}>
        {CHILDREN.map((child) => (
          <div
            key={child.name}
            className="flex items-center gap-2"
            style={childCardStyle}
          >
            <Avatar initials={child.name[0]} size={30} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--teal-dk)" }}>{child.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{child.age}</div>
            </div>
          </div>
        ))}
        <button className="btn-outline" style={{ padding: "8px 16px", fontSize: 13, borderStyle: "dashed" }}>
          + Add child
        </button>
      </div>
    </SectionCard>
  );
}
