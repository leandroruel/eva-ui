import { resolveEvaColor } from "../../theme/colors";
import "./Chamfer.css";

type ChamferProps = {
  active?: boolean;
  color?: string; // ex: "var(--eva-orange)" or "--eva-orange" token, ou "yellow"
  size?: string; // ex: "12px"
  className?: string;
  children: React.ReactNode;
  as?: "div" | "button" | "section";
  onClick?: () => void;
  style?: React.CSSProperties;
};

export function Chamfer({
  active = false,
  color,
  size,
  className = "",
  children,
  as: Tag = "div",
  onClick,
  style,
}: ChamferProps) {
  const resolvedColor = color ? resolveEvaColor(color) : undefined;

  const chamferStyle: React.CSSProperties = {
    ...(resolvedColor
      ? {
          ["--chamfer-color" as string]: resolvedColor,
          ["--n-color" as string]: resolvedColor,
        }
      : {}),
    ...(size ? { ["--chamfer" as string]: size } : {}),
    ...style,
  };

  return (
    <Tag
      className={`chamfer ${active ? "is-on" : ""} ${className}`.trim()}
      style={chamferStyle}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
