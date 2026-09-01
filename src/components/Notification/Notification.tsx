import { useEffect, useState } from "react";
import { Chamfer } from "../Chamfer/Chamfer";
import { EvaText } from "../EvaText/EvaText";
import "./Notification.css";

export const ENTRY_FLASH_MS = 640;

export type NotificationProps = {
  id: string;
  color: string;
  hazard: boolean;
  filled: boolean;
  icon: string;
  title: string;
  sub: string;
  duration: number;
  onDismiss: (id: string) => void;
};

export function NotificationFlag({ hazard, icon }: { hazard: boolean; icon: string }) {
  return (
    <span className={`notif-flag ${hazard ? "is-hazard" : ""}`}>
      <span className="notif-flag-icon">{icon}</span>
    </span>
  );
}

export function NotificationTimer({ duration, shrunk }: { duration: number; shrunk: boolean }) {
  return (
    <div
      className={`notif-timer ${shrunk ? "is-shrunk" : ""}`}
      style={{ ["--notif-duration" as string]: `${duration}ms` }}
    />
  );
}

export function Notification({
  id,
  color,
  hazard,
  filled,
  icon,
  title,
  sub,
  duration,
  onDismiss,
}: NotificationProps) {
  const [phase, setPhase] = useState<"entering" | "active">("entering");
  const [barShrunk, setBarShrunk] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase("active"), ENTRY_FLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "active" || !duration) return;
    const raf = requestAnimationFrame(() => setBarShrunk(true));
    const dismissTimer = setTimeout(() => onDismiss(id), duration);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(dismissTimer);
    };
  }, [phase, duration, id, onDismiss]);

  return (
    <Chamfer
      active={filled}
      color={color}
      size="14px"
      className={`notif-card ${phase === "entering" ? "is-entering" : ""}`}
    >
      <NotificationFlag hazard={hazard} icon={icon} />
      <span className="notif-text">
        <EvaText variant="title">{title}</EvaText>
        <EvaText variant="sub">{sub}</EvaText>
      </span>
      <button className="notif-close" onClick={() => onDismiss(id)} aria-label="dismiss">
        ×
      </button>
      {phase === "active" && duration > 0 && (
        <NotificationTimer duration={duration} shrunk={barShrunk} />
      )}
    </Chamfer>
  );
}
