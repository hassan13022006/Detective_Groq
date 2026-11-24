"use client";

import React from "react";
import { Skull, Clock } from "lucide-react";
import { PublicVictim } from "@/types/mystery";

interface VictimCardProps {
  victim: PublicVictim;
  caseTitle?: string;
}

export function VictimCard({ victim }: VictimCardProps) {
  return (
    <div className="relative overflow-hidden bg-noir-900 border border-noir-750 rounded-lg p-3 sm:p-4 shadow-dossier">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Silhouette avatar + Victim Name & Role */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-noir-950 border border-noir-700 flex items-center justify-center text-rose-500/80 shrink-0 shadow-inner">
            <Skull className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-typewriter font-bold text-rose-400 uppercase tracking-wider">
                DECEASED VICTIM
              </span>
              <span className="stamp-badge text-[8px] py-0 px-1 stamp-red">
                AUTOPSY
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-noir-100 font-sans tracking-tight truncate">
              {victim.name}
            </h2>
            <div className="text-xs text-amber-400/90 font-typewriter truncate">
              {victim.role}
            </div>
          </div>
        </div>

        {/* Right: Cause and Time of Death */}
        <div className="sm:max-w-md md:max-w-lg bg-noir-950/80 rounded border border-noir-800 p-2 sm:px-3 sm:py-2 text-xs flex items-start gap-2 text-noir-200">
          <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-semibold text-rose-300 font-typewriter text-[11px] block sm:inline sm:mr-1">
              Cause &amp; Time:
            </span>
            <span className="font-sans text-[11px] sm:text-xs text-noir-300 leading-snug">
              {victim.cause_of_death}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
