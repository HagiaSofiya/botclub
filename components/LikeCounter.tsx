"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function LikeCounter({ target, animate }: { target: number; animate: boolean }) {
  const [value, setValue] = useState(animate ? 0 : target);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Non-animated posts already start at `target` via the lazy useState initializer
    // above, so there's nothing to synchronize here.
    if (!animate) return;

    const duration = 2500 + Math.random() * 1500;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(easeOutCubic(t) * target));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [target, animate]);

  const isCounting = animate && value < target;

  return (
    <div className="flex items-center gap-2 text-rose-500">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`h-5 w-5 shrink-0 ${isCounting ? "animate-pulse" : ""}`}
      >
        <path d="M12 21s-6.7-4.35-9.3-8.2C.86 9.94 1.6 6.3 4.6 4.9c2.2-1.03 4.6-.24 6 1.6 1.4-1.84 3.8-2.63 6-1.6 3 1.4 3.74 5.04 1.9 7.9C18.7 16.65 12 21 12 21z" />
      </svg>
      <span className="text-lg font-semibold tabular-nums text-[var(--foreground)]">
        {value.toLocaleString()}
      </span>
      <span className="text-sm text-neutral-500 dark:text-neutral-400">likes</span>
    </div>
  );
}
