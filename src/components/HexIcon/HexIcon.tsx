import { resolveEvaColor } from "../../theme/colors";
import "./HexIcon.css";

type HexIconProps = {
  on: boolean;
  color: string; // ex: "green" | "orange" | "red" — mapeado para var(--eva-*)
};

export function HexIcon({ on, color }: HexIconProps) {
  return (
    <span
      className={`hex-icon ${on ? "is-on" : ""}`}
      style={{ ["--hex-color" as string]: resolveEvaColor(color) }}
    >
      <span className="hex-icon-inner" />
    </span>
  );
}
