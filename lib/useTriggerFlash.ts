"use client";

import { useEffect, useState } from "react";

/** Flips true when `trigger` changes, then back to false after `duration` ms. */
export function useTriggerFlash(trigger: number | undefined, duration = 900): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger === undefined) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(true);
    const t = setTimeout(() => setActive(false), duration);
    return () => clearTimeout(t);
  }, [trigger, duration]);

  return active;
}
