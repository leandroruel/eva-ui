import "./EvaEyebrow.css";

type EvaEyebrowProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
  align?: "space-between" | "flex-end";
  className?: string;
};

export function EvaEyebrow({
  left,
  right,
  align = "space-between",
  className = "",
}: EvaEyebrowProps) {
  return (
    <div
      className={`nerv-eyebrow ${className}`.trim()}
      style={{ justifyContent: align === "flex-end" ? "flex-end" : "space-between" }}
    >
      {left}
      {right && <span>{right}</span>}
    </div>
  );
}
