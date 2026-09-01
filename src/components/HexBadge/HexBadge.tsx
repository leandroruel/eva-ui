import "./HexBadge.css";

type HexBadgeProps = {
  status: "warning" | "error" | "success";
  className?: string;
};

export function HexBadge({ status, className = "" }: HexBadgeProps) {
  return (
    <span className={`hex-badge hex-badge--${status} ${className}`.trim()}>
      {status === "success" ? "✓" : "!"}
    </span>
  );
}
