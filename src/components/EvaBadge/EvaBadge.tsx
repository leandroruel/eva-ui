import { resolveEvaColor } from "../../theme/colors";
import "./EvaBadge.css";

type EvaBadgeProps = {
  active?: boolean;
  color?: string; // "green" | "orange" | "red" | "var(--eva-...)"
  children: React.ReactNode;
  className?: string;
};

export function EvaBadge({
  active = false,
  color = "orange",
  children,
  className = "",
}: EvaBadgeProps) {
  const resolved = resolveEvaColor(color);

  return (
    <span
      className={`eva-badge ${active ? "is-on" : ""} ${className}`.trim()}
      style={{ ["--row-color" as string]: resolved }}
    >
      {children}
    </span>
  );
}
