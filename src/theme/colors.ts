// Single source of truth for EVA palette — eliminates duplicated colorMap objects
// across EvaButton, Chamfer, EvaBadge, HazardStrip, etc.

export const EVA_COLORS = {
  orange: "var(--eva-orange)",
  red: "var(--eva-red)",
  green: "var(--eva-green)",
  yellow: "var(--eva-yellow)",
  cyan: "var(--eva-cyan)",
  gray: "var(--eva-gray)",
  dim: "var(--eva-dim)",
  black: "var(--eva-black)",
} as const;

export type EvaColor = keyof typeof EVA_COLORS;

// Semantic aliases used by StatusStack / PilotField
export const SEMANTIC_COLOR_MAP: Record<string, EvaColor> = {
  warning: "yellow",
  error: "red",
  success: "green",
};

export function resolveEvaColor(color: string): string {
  // already a CSS var: "var(--eva-...)" or "var(--pilot-color)"
  if (color.startsWith("var(")) return color;

  // semantic -> palette
  const mapped = SEMANTIC_COLOR_MAP[color];
  if (mapped) return EVA_COLORS[mapped];

  // palette name -> var
  if (color in EVA_COLORS) return EVA_COLORS[color as EvaColor];

  // fallback: "orange" -> "var(--eva-orange)", also handles "--eva-orange"
  if (color.startsWith("--")) return `var(${color})`;
  return `var(--eva-${color})`;
}
