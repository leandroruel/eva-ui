import { EvaBadge } from "../EvaBadge/EvaBadge";
import { EvaText } from "../EvaText/EvaText";
import { HexIcon } from "../HexIcon/HexIcon";
import "./SystemRow.css";

type SystemRowProps = {
  jp: string;
  en: string;
  on: boolean;
  onClick: () => void;
  color: string;
  badgeOn: string;
  badgeOff: string;
};

export function SystemRow({ jp, en, on, onClick, color, badgeOn, badgeOff }: SystemRowProps) {
  return (
    <button
      className={`system-row ${on ? "is-on" : ""}`}
      style={{ ["--row-color" as string]: `var(--eva-${color})` }}
      onClick={onClick}
      aria-pressed={on}
    >
      <HexIcon on={on} color={color} />
      <span className="system-row-text">
        <EvaText variant="jp">{jp}</EvaText>
        <EvaText variant="enSmall">{en}</EvaText>
      </span>
      <EvaBadge active={on} color={color}>
        {on ? badgeOn : badgeOff}
      </EvaBadge>
    </button>
  );
}
