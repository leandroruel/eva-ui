import { Chamfer } from "../Chamfer/Chamfer";
import { EvaText } from "../EvaText/EvaText";
import { HazardStrip } from "../HazardStrip/HazardStrip";
import { HexBadge } from "../HexBadge/HexBadge";
import "./PilotField.css";

export type Pilot = {
  eva: string;
  name: string;
  validId: string;
};

export type PilotStatus = "warning" | "error" | "success";

export function getPilotStatus(value: string, validId: string): PilotStatus {
  return value.trim() === ""
    ? "warning"
    : value.trim().toUpperCase() === validId
      ? "success"
      : "error";
}

type PilotFieldProps = {
  pilot: Pilot;
  value: string;
  onChange: (value: string) => void;
  index: number;
};

export function PilotField({ pilot, value, onChange, index }: PilotFieldProps) {
  const status = getPilotStatus(value, pilot.validId);

  return (
    <div className={`pilot-wrap is-${status}`}>
      <Chamfer size="10px" className="pilot-box">
        <div className="pilot-input-row">
          <EvaText variant="pilotLabel" as="label" htmlFor={`pilot-id-${index}`}>
            {pilot.eva}:
          </EvaText>
          <input
            id={`pilot-id-${index}`}
            className="pilot-input"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder={pilot.name}
            spellCheck={false}
          />
          <HexBadge status={status} />
        </div>
        <HazardStrip color="pilot" height="5px" />
      </Chamfer>

      <div className="pilot-footer">
        <EvaText variant="pilotStatus">
          {status === "warning" && "待機"}
          {status === "error" && "警告・認証失敗"}
          {status === "success" && "認証確認 · VERIFIED"}
        </EvaText>
        <EvaText variant="pilotDetail">
          {status === "warning" && "PRESS TO EDIT"}
          {status === "error" && "INVALID PILOT ID"}
          {status === "success" && "PILOT VERIFIED"}
        </EvaText>
      </div>
    </div>
  );
}

export function PilotStack({
  pilots,
  values,
  onChange,
}: {
  pilots: Pilot[];
  values: string[];
  onChange: (idx: number, value: string) => void;
}) {
  return (
    <div className="pilot-stack">
      {pilots.map((pilot, idx) => (
        <PilotField
          key={pilot.eva}
          pilot={pilot}
          value={values[idx]}
          onChange={(v) => onChange(idx, v)}
          index={idx}
        />
      ))}
    </div>
  );
}
