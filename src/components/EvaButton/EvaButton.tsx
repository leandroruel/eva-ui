import "./EvaButton.css";

export type EvaButtonVariant =
  | "warning"
  | "error"
  | "success"
  | "orange"
  | "red"
  | "green"
  | "yellow"
  | "cyan"
  | "gray";

type EvaButtonProps = {
  variant?: EvaButtonVariant;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  "aria-pressed"?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export function EvaButton({
  variant = "orange",
  active = false,
  onClick,
  children,
  className = "",
  "aria-pressed": ariaPressed,
  disabled,
  type = "button",
}: EvaButtonProps) {
  const variantClass = variant;
  const activeClass = active ? "is-on" : "";

  return (
    <button
      type={type}
      className={`eva-button chamfer ${variantClass} ${activeClass} ${className}`.trim()}
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
