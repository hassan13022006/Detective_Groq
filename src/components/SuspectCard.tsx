"use client";

import React from "react";
import { UserCheck, MessageSquare, AlertOctagon, Sparkles } from "lucide-react";
import { PublicSuspect } from "@/types/mystery";
import { soundFX } from "@/lib/soundEffects";

interface SuspectCardProps {
  suspect: PublicSuspect;
  index: number;
  isActive: boolean;
  nervousness?: number;
  messageCount: number;
  onInterrogate: (suspectId: string) => void;
}

export function SuspectCard({
  suspect,
  index,
  isActive,
  nervousness = 20,
  messageCount,
  onInterrogate,
}: SuspectCardProps) {
  let stressColor = "text-emerald-400";
  if (nervousness >= 75) stressColor = "text-rose-400 font-bold";
  else if (nervousness >= 45) stressColor = "text-amber-400";

  return (
    <div
      className={`relative bg-noir-900 border rounded-lg p-4 transition-all duration-200 flex flex-col justify-between shadow-sm ${
        isActive
          ? "border-amber-500/60 ring-1 ring-amber-500/40 bg-noir-850"
          : "border-noir-800 hover:border-noir-700"
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-noir-800">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-typewriter font-bold bg-noir-800 text-noir-300">
              SUSPECT #{index + 1}
            </span>
            <span className="text-[11px] font-typewriter text-amber-500/90 font-medium">
              {suspect.role}
            </span>
          </div>

          <span className={`text-[10px] font-typewriter ${stressColor}`}>
            Stress: {nervousness}%
          </span>
        </div>

        <h3 className="text-base font-bold text-noir-100 font-sans mb-1 tracking-tight">
          {suspect.name}
        </h3>

        <p className="text-xs text-noir-300 font-sans leading-relaxed mb-3">
          {suspect.public_bio}
        </p>
      </div>

      <div className="pt-2 border-t border-noir-800 flex items-center justify-between">
        <div className="text-[10px] font-typewriter text-noir-400 flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-noir-500" />
          <span>{messageCount} exchanges</span>
        </div>

        <button
          onClick={() => {
            soundFX.playPaperRustle();
            onInterrogate(suspect.id);
          }}
          className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-noir-950 font-typewriter font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Interrogate</span>
        </button>
      </div>
    </div>
  );
}
