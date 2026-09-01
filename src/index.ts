// EVA-UI — Theme barrel
// Exporta tokens, hooks e componentes como biblioteca

export { default as NervDashboard } from "./layouts/NervDashboard/NervDashboard";
export { default as EvangelionNERVDashboard } from "./layouts/NervDashboard/NervDashboard";

export { useSyncEqualizer, BAR_COUNT } from "./hooks/useSyncEqualizer";
export { useAnimatedNumber } from "./hooks/useAnimatedNumber";

// Primitives
export { EvaText } from "./components/EvaText/EvaText";
export { Chamfer } from "./components/Chamfer/Chamfer";
export { HazardStrip } from "./components/HazardStrip/HazardStrip";
export { EvaEyebrow } from "./components/EvaEyebrow/EvaEyebrow";
export { EvaBadge } from "./components/EvaBadge/EvaBadge";
export { HexBadge } from "./components/HexBadge/HexBadge";
export { HexIcon } from "./components/HexIcon/HexIcon";

// Composed
export { EvaButton } from "./components/EvaButton/EvaButton";
export { SystemRow } from "./components/SystemRow/SystemRow";
export {
  Notification,
  NotificationFlag,
  NotificationTimer,
  ENTRY_FLASH_MS,
} from "./components/Notification/Notification";
export { StatusStack } from "./components/StatusStack/StatusStack";
export {
  SyncRatio,
  SyncBars,
  SyncTrack,
  SyncReadout,
  SyncLimitRow,
  SyncLimitLine,
} from "./components/SyncRatio/SyncRatio";
export { PilotField, PilotStack, getPilotStatus } from "./components/PilotField/PilotField";
export { TargetBox } from "./components/TargetBox/TargetBox";
export { SystemControl } from "./components/SystemControl/SystemControl";

export type { EvaStatus } from "./components/StatusStack/StatusStack";
export type { EvaButtonVariant } from "./components/EvaButton/EvaButton";
export type { EvaTextVariant, EvaTextTone } from "./components/EvaText/EvaText";
export type { NotificationProps } from "./components/Notification/Notification";
export type { Pilot, PilotStatus } from "./components/PilotField/PilotField";

// CSS entry points — importe no consumidor:
// import "eva-ui/src/theme/index.css";
// import "eva-ui/dist/eva-ui.css";
