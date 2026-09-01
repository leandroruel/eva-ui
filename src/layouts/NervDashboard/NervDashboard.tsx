import { useState, useEffect, useCallback } from "react";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import { useSyncEqualizer } from "../../hooks/useSyncEqualizer";
import { StatusStack, type EvaStatus } from "../../components/StatusStack/StatusStack";
import { SyncRatio } from "../../components/SyncRatio/SyncRatio";
import { Notification } from "../../components/Notification/Notification";
import { PilotStack, type Pilot } from "../../components/PilotField/PilotField";
import { TargetBox } from "../../components/TargetBox/TargetBox";
import { SystemControl } from "../../components/SystemControl/SystemControl";
import { EvaEyebrow } from "../../components/EvaEyebrow/EvaEyebrow";
import { EvaText } from "../../components/EvaText/EvaText";

import "../../theme/index.css";
import "./NervDashboard.css";

const PILOT_ROSTER: Pilot[] = [
  { eva: "EVA-01", name: "SHINJI", validId: "IKARI-S-0083" },
  { eva: "EVA-00", name: "REI", validId: "AYANAMI-R-0001" },
  { eva: "EVA-02", name: "ASUKA", validId: "SORYU-A-0002" },
];

export default function NervDashboard() {
  const [status, setStatus] = useState<EvaStatus>("idle");
  const activated = status === "success";

  const [pilotValues, setPilotValues] = useState<string[]>(["IKARI-S-0083", "", "WRONG-ID"]);
  const [toggles, setToggles] = useState<boolean[]>([true, true, false]);
  const [powerClock, setPowerClock] = useState(299); // 04:59
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const syncTarget = activated ? 85 : 23;
  const syncValue = useAnimatedNumber(syncTarget);
  const bars = useSyncEqualizer(syncValue, activated);

  const setPilotValue = useCallback((idx: number, value: string) => {
    setPilotValues((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }, []);

  useEffect(() => {
    if (!activated) return;
    const id = setInterval(() => {
      setPowerClock((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [activated]);

  const mm = String(Math.floor(powerClock / 60)).padStart(2, "0");
  const ss = String(powerClock % 60).padStart(2, "0");

  const selectStatus = useCallback((next: EvaStatus) => {
    setStatus((current) => (current === next ? "idle" : next));
  }, []);

  const flipToggle = useCallback((idx: number) => {
    setToggles((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setDismissed((prev) => ({ ...prev, [id]: true }));
  }, []);

  const NOTIFICATIONS = [
    {
      id: "success",
      color: "var(--eva-green)",
      hazard: true,
      filled: false,
      icon: "✓",
      title: "初号機 起動完了",
      sub: "EVA-01 ACTIVATED",
      duration: 8000,
    },
    {
      id: "power",
      color: "var(--eva-orange)",
      hazard: true,
      filled: false,
      icon: "!",
      title: `内部電源 残り${mm}:${ss}`,
      sub: `INTERNAL POWER · ${mm}:${ss} LEFT`,
      duration: 12000,
    },
    {
      id: "angel",
      color: "var(--eva-red)",
      hazard: true,
      filled: true,
      icon: "!",
      title: "第4使徒 接近",
      sub: "ANGEL APPROACHING · PATTERN BLUE",
      duration: 15000,
    },
    {
      id: "sync-info",
      color: "var(--eva-cyan)",
      hazard: false,
      filled: false,
      icon: "i",
      title: `シンクロ率 ${syncValue.toFixed(1)}%`,
      sub: "SYNC RATIO UPDATED",
      duration: 10000,
    },
  ];

  return (
    <div className={`nerv-root ${activated ? "is-activated" : ""}`}>
      <div className="nerv-grid">
        {/* COLUNA ESQUERDA */}
        <div className="nerv-col">
          <StatusStack status={status} onSelect={selectStatus} />
          <SyncRatio value={syncValue} bars={bars} />
        </div>

        {/* COLUNA CENTRO */}
        <div className="nerv-col">
          <div>
            <EvaEyebrow
              align="flex-end"
              left={<EvaText variant="eyebrowStrong">NERV · 通知 NOTIFICATIONS</EvaText>}
            />
            <div className="notif-stack">
              {NOTIFICATIONS.filter((n) => !dismissed[n.id]).map((n) => (
                <Notification key={n.id} {...n} onDismiss={dismissNotification} />
              ))}
            </div>
          </div>

          <div>
            <EvaEyebrow
              left={<EvaText variant="eyebrowStrong">パイロットID</EvaText>}
              right={<EvaText variant="eyebrow">PILOT ID · NERV</EvaText>}
            />
            <PilotStack pilots={PILOT_ROSTER} values={pilotValues} onChange={setPilotValue} />
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="nerv-col">
          <TargetBox />
          <SystemControl toggles={toggles} onToggle={flipToggle} />
        </div>
      </div>
    </div>
  );
}

// Compat: mantém o nome original para imports legados
export { NervDashboard as EvangelionNERVDashboard };
