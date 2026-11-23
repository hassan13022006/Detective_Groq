"use client";

import React from "react";
import { Skull, Clock, AlertCircle, FileText } from "lucide-react";
import { PublicVictim } from "@/types/mystery";

interface VictimCardProps {
  victim: PublicVictim;
  caseTitle: string;
}

export function VictimCard({ victim, caseTitle }: VictimCardProps) {
  return (
    <div className="relative overflow-hidden bg-noir-900 border border-noir-750 rounded-lg p-5 shadow-dossier">
      {/* Top red classified banner */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-noir-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-typewriter font-bold text-rose-400 tracking-wider uppercase">
            HOMICIDE INCIDENT REPORT
          </span>
        </div>
        <span className="stamp-badge text-[10px] stamp-red">CONFIDENTIAL</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Noir Victim Silhouette / Police Photo placeholder */}
        <div className="relative w-28 h-32 bg-noir-950 border border-noir-700 rounded flex flex-col items-center justify-center shrink-0 shadow-inner group">
          <div className="w-16 h-16 rounded-full bg-noir-850 border border-noir-700 flex items-center justify-center text-rose-500/80 mb-1">
            <Skull className="w-9 h-9" />
          </div>
          <span className="text-[10px] font-typewriter text-noir-400 uppercase tracking-tighter">
            DECEASED
          </span>
          <div className="absolute inset-x-0 bottom-0 py-0.5 bg-rose-950/80 text-rose-300 text-[8px] text-center font-typewriter uppercase tracking-widest border-t border-rose-900">
            AUTOPSY PENDING
          </div>
        </div>

        {/* Victim Information Details */}
        <div className="flex-1 space-y-2.5 font-typewriter">
          <div>
            <div className="text-[11px] text-noir-400 uppercase">Victim of Record</div>
            <h2 className="text-xl font-bold text-noir-100 font-sans tracking-tight">
              {victim.name}
            </h2>
            <div className="text-xs text-amber-400/90 font-medium">
              {victim.role}
            </div>
          </div>

          <div className="p-3 bg-noir-950/80 rounded border border-noir-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Cause &amp; Time of Death:
              </span>
            </div>
            <p className="text-noir-200 text-xs font-sans leading-relaxed">
              {victim.cause_of_death}
            </p>
          </div>

          <div className="text-[11px] text-noir-400 flex items-center gap-1.5 pt-1">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Case: <strong className="text-noir-200 font-sans">{caseTitle}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
