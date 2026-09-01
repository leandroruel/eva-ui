import { EvaText } from "../EvaText/EvaText";
import { SystemRow } from "../SystemRow/SystemRow";
import "./SystemControl.css";

type SystemControlProps = {
  toggles: boolean[];
  onToggle: (idx: number) => void;
};

export function SystemControl({ toggles, onToggle }: SystemControlProps) {
  const toggleCount = toggles.filter(Boolean).length;
  const approved = toggleCount === 3;

  return (
    <div>
      <div className="system-list">
        <SystemRow
          jp="A.T.フィールド 展開"
          en="DEPLOY A.T. FIELD"
          on={toggles[0]}
          color="green"
          badgeOn="許可"
          badgeOff="未設定"
          onClick={() => onToggle(0)}
        />
        <SystemRow
          jp="N²爆雷 使用許可"
          en="AUTHORIZE N² MINE"
          on={toggles[1]}
          color="orange"
          badgeOn="許可"
          badgeOff="未設定"
          onClick={() => onToggle(1)}
        />
        <SystemRow
          jp="自爆装置 起動"
          en="ARM SELF-DESTRUCT"
          on={toggles[2]}
          color="red"
          badgeOn="許可"
          badgeOff="未設定"
          onClick={() => onToggle(2)}
        />
      </div>
      <div className="system-footer">
        <EvaText variant="count">{toggleCount}/3 SELECTED</EvaText>
        <EvaText
          variant="magi"
          tone={approved ? "orange" : "dim"}
          className={approved ? "is-approved" : ""}
        >
          MAGI {approved ? "可決" : "審議中"}
        </EvaText>
      </div>
    </div>
  );
}
