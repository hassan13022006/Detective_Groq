"use client";

import React, { useEffect } from "react";
import { Activity, Heart } from "lucide-react";
import { soundFX } from "@/lib/soundEffects";

interface StressMeterProps {
  nervousness: number; // 0 - 100
  suspectName: string;
}

export function StressMeter({ nervousness, suspectName }: StressMeterProps) {
  // Play subtle heartbeat if nervousness is high
  useEffect(() => {
    if (nervousness >= 70) {
      soundFX.playHeartbeat(1.4);
    } else if (nervousness >= 45) {
      soundFX.playHeartbeat(1.0);
    }
  }, [nervousness]);

  let statusLabel = "CALM & COMPOSED";
  let barGradient = "from-emerald-500 to-teal-400";
  let pulseSpeed = "duration-1000";
  let textColor = "text-emerald-400";
  let borderColor = "border-emerald-500/30";

  if (nervousness >= 80) {
    statusLabel = "PANICKED / CRACKING UNDER PRESSURE";
    barGradient = "from-rose-600 via-red-500 to-amber-500";
    pulseSpeed = "duration-300";
    textColor = "text-rose-400";
    borderColor = "border-rose-500/60 shadow-glowRed";
  } else if (nervousness >= 55) {
    statusLabel = "AGITATED / DEFENSIVE";
    barGradient = "from-amber-500 to-orange-500";
    pulseSpeed = "duration-500";
    textColor = "text-amber-400";
    borderColor = "border-amber-500/40 shadow-glowAmber";
  } else if (nervousness >= 30) {
    statusLabel = "GUARDED / CAUTIOUS";
    barGradient = "from-cyan-500 to-amber-400";
    textColor = "text-cyan-400";
  }

  return (
    <div className={`p-3 bg-noir-900/90 rounded border ${borderColor} transition-all duration-300`}>
      <div className="flex items-center justify-between text-xs font-typewriter mb-1.5">
        <div className="flex items-center gap-1.5">
          <Activity className={`w-3.5 h-3.5 ${textColor} animate-pulse`} />
          <span className="text-noir-300 uppercase tracking-wider text-[11px]">
            Stress / Pulse Monitor:
          </span>
          <span className="text-noir-100 font-semibold">{suspectName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className={`w-3.5 h-3.5 text-rose-500 ${nervousness >= 50 ? "animate-bounce" : ""}`} />
          <span className={`font-bold ${textColor}`}>{nervousness}%</span>
        </div>
      </div>

      <div className="relative w-full h-2.5 bg-noir-950 rounded-full overflow-hidden border border-noir-700/60 p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(5, nervousness)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-1 text-[10px] font-typewriter text-noir-400">
        <span className="tracking-tight">{statusLabel}</span>
        <span>BPM ESTIMATE: {Math.round(65 + (nervousness * 0.95))}</span>
      </div>
    </div>
  );
}
