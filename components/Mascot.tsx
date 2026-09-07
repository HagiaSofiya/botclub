"use client";

import { useEffect, useState } from "react";
import { ACCENT_MINT, ACCENT_PINK, ACCENT_SKY } from "@/lib/avatar";

export function Mascot({ winkTrigger }: { winkTrigger?: number }) {
  const [winking, setWinking] = useState(false);

  useEffect(() => {
    if (winkTrigger === undefined) return;
    // Flash the wink immediately when triggered, then clear it after 900ms.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWinking(true);
    const t = setTimeout(() => setWinking(false), 900);
    return () => clearTimeout(t);
  }, [winkTrigger]);

  return (
    <div className="relative h-[72px] w-[72px] shrink-0 self-start" aria-hidden="true">
      <div
        className="absolute left-[6px] top-[20px] h-14 w-14 rounded-full border-2 border-foreground"
        style={{ backgroundColor: ACCENT_SKY }}
      />
      <div
        className="absolute left-[10px] top-[2px] h-[26px] w-12 rounded-t-[26px] border-[5px] border-b-0"
        style={{ borderColor: ACCENT_PINK }}
      />
      <div
        className="absolute left-[2px] top-[26px] h-3.5 w-3.5 rounded-full border-2 border-foreground"
        style={{ backgroundColor: ACCENT_PINK }}
      />
      <div
        className="absolute right-[2px] top-[26px] h-3.5 w-3.5 rounded-full border-2 border-foreground"
        style={{ backgroundColor: ACCENT_PINK }}
      />
      <div
        className="absolute left-6 top-10 h-[7px] w-[7px] rounded-full bg-foreground transition-transform duration-200"
        style={{ transform: winking ? "scaleY(0.1)" : "scaleY(1)" }}
      />
      <div
        className="absolute left-[42px] top-[43px] h-[2.5px] w-[9px] -rotate-[8deg] rounded bg-foreground transition-transform duration-200"
        style={{ transform: winking ? "translateY(-4px) rotate(-8deg)" : "translateY(0) rotate(-8deg)" }}
      />
      <div className="absolute left-[30px] top-[50px] h-1.5 w-3 rounded-b-full border-b-[2.5px] border-foreground" />
      <div className="absolute -right-0.5 top-0 h-2 w-2 rotate-45" style={{ backgroundColor: ACCENT_MINT }} />
    </div>
  );
}
