import { EvaButton } from "../EvaButton/EvaButton";
import { EvaText } from "../EvaText/EvaText";
import "./StatusStack.css";

export type EvaStatus = "idle" | "warning" | "error" | "success";

type StatusStackProps = {
  status: EvaStatus;
  onSelect: (next: EvaStatus) => void;
};

export function StatusStack({ status, onSelect }: StatusStackProps) {
  const activated = status === "success";

  return (
    <div>
      <div className="status-stack">
        <EvaButton
          variant="warning"
          active={status === "warning"}
          onClick={() => onSelect("warning")}
          aria-pressed={status === "warning"}
        >
          <EvaText variant="kanji">警告</EvaText>
          <EvaText variant="en">WARNING</EvaText>
        </EvaButton>

        <EvaButton
          variant="error"
          active={status === "error"}
          onClick={() => onSelect("error")}
          aria-pressed={status === "error"}
        >
          <EvaText variant="kanji">異常</EvaText>
          <EvaText variant="en">ERROR</EvaText>
        </EvaButton>

        <EvaButton
          variant="success"
          active={status === "success"}
          onClick={() => onSelect("success")}
          aria-pressed={status === "success"}
        >
          <EvaText variant="kanji">{activated ? "起動完了" : "起動"}</EvaText>
          <EvaText variant="en">{activated ? "ACTIVATED" : "SUCCESS"}</EvaText>
        </EvaButton>
      </div>

      <EvaText
        variant="caption"
        tone={
          status === "idle"
            ? "default"
            : status === "warning"
              ? "warning"
              : status === "error"
                ? "error"
                : "success"
        }
        className="activate-caption"
      >
        {status === "warning" && "EVA-01 · STATUS / WARNING"}
        {status === "error" && "EVA-01 · STATUS / ERROR"}
        {status === "success" && "EVA-01 · ACTIVE / LOCKED / SYNCED / OK"}
        {status === "idle" && "EVA-01 · IDLE / HOVER / PRESS / OK"}
      </EvaText>
    </div>
  );
}
