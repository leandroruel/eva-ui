import { useState, useEffect, useRef } from "react";

const BAR_COUNT = 20;

export function useSyncEqualizer(target: number, active: boolean): number[] {
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(6));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;

    function tick() {
      frame++;
      setBars((prev) =>
        prev.map((_, i) => {
          const envelope = 1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
          const jitter = active
            ? Math.sin(frame / 4 + i * 1.3) * 8 + Math.random() * 6
            : Math.random() * 2;
          const base = active ? target : 8;
          const value = base * (0.4 + envelope * 0.6) + jitter;
          return Math.max(4, Math.min(100, value));
        }),
      );
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, active]);

  return bars;
}

export { BAR_COUNT };
