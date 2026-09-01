import { resolveEvaColor } from "../../theme/colors";
import "./HazardStrip.css";

type HazardStripProps = {
  color?: string; // "var(--eva-orange)" | "yellow" | "pilot" (usa --pilot-color)
  height?: string; // "5px"
  animated?: boolean;
  className?: string;
};

export function HazardStrip({
  color = "pilot",
  height = "5px",
  animated = false,
  className = "",
}: HazardStripProps) {
  const usePilot = color === "pilot";
  const resolvedColor = usePilot ? "var(--pilot-color)" : resolveEvaColor(color);

  return (
    <div
      className={`hazard-strip ${animated ? "is-animated" : ""} ${className}`.trim()}
      style={{
        ["--hazard-color" as string]: resolvedColor,
        height,
      }}
    />
  );
}
