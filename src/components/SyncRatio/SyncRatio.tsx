import { EvaText } from "../EvaText/EvaText";
import "./SyncRatio.css";

type SyncRatioProps = {
  value: number;
  bars: number[];
};

export function SyncBars({ bars }: { bars: number[] }) {
  return (
    <div className="sync-bars">
      {bars.map((h, i) => (
        <div key={i} className="sync-bar" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function SyncLimitRow() {
  return <EvaText variant="limitRow">絶対境界線 ABSOLUTE BORDERLINE</EvaText>;
}

export function SyncLimitLine() {
  return <div className="sync-limit-line" />;
}

export function SyncTrack({ value }: { value: number }) {
  return (
    <div className="sync-track" style={{ ["--fill" as string]: `${value}%` }}>
      <div className="sync-track-fill" />
      <div className="sync-track-marker" />
    </div>
  );
}

export function SyncReadout({ value }: { value: number }) {
  return (
    <div className="sync-readout">
      <EvaText variant="readoutLabel">SYNC RATIO シンクロ率</EvaText>
      <EvaText variant="readoutValue">
        {value.toFixed(1)}
        <small>%</small>
      </EvaText>
    </div>
  );
}

export function SyncRatio({ value, bars }: SyncRatioProps) {
  return (
    <div>
      <SyncLimitRow />
      <SyncLimitLine />
      <SyncBars bars={bars} />
      <SyncTrack value={value} />
      <SyncReadout value={value} />
    </div>
  );
}
