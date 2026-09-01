import "./EvaText.css";

export type EvaTextVariant =
  | "kanji" // 15-19px 700 (EvaButton)
  | "en" // 10px 600 0.16em (EvaButton)
  | "caption" // 10px 0.15em (activate-caption)
  | "eyebrow" // 10px 0.2em
  | "eyebrowStrong" // 10px bold inside eyebrow
  | "limitRow" // 9.5px red
  | "readoutLabel" // 11px
  | "readoutValue" // 26-38px 700 yellow
  | "title" // 12.5px 800 (notif)
  | "sub" // 9.5px 600 (notif)
  | "pilotLabel" // 11px 700 pilotColor
  | "pilotStatus" // 9px 700 pilotColor
  | "pilotDetail" // 9px gray
  | "target" // 15-19px 700 orange
  | "jp" // 13px 700
  | "enSmall" // 9px 0.1em
  | "badge" // 10px 800
  | "count" // 11px gray
  | "magi" // 11px 800 dim/orange
  | "body"; // default 12px

export type EvaTextTone =
  | "default"
  | "orange"
  | "red"
  | "green"
  | "yellow"
  | "cyan"
  | "gray"
  | "dim"
  | "pilot" // uses --pilot-color
  | "inherit"
  | "warning"
  | "error"
  | "success";

type EvaTextProps = {
  variant?: EvaTextVariant;
  tone?: EvaTextTone;
  as?: "span" | "strong" | "label" | "small" | "p" | "b";
  className?: string;
  children: React.ReactNode;
  htmlFor?: string; // when as="label"
};

export function EvaText({
  variant = "body",
  tone = "default",
  as: Tag = "span",
  className = "",
  children,
  htmlFor,
}: EvaTextProps) {
  const variantClass = `eva-text--${variant}`;
  const toneClass = tone !== "default" ? `eva-text--tone-${tone}` : "";

  return (
    <Tag
      className={`eva-text ${variantClass} ${toneClass} ${className}`.trim()}
      {...(Tag === "label" && htmlFor ? { htmlFor } : {})}
    >
      {children}
    </Tag>
  );
}
