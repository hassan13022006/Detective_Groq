"use client";

import React from "react";
import { Search, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { PublicClue, ForensicsResult } from "@/types/mystery";
import { soundFX } from "@/lib/soundEffects";

interface ClueCardProps {
  clue: PublicClue;
  index: number;
  forensicsResult?: ForensicsResult;
  isScanning: boolean;
  actionPoints: number;
  onAskForensics: (clueId: string) => void;
  onSelectForInterrogation?: (clueId: string) => void;
}

export function ClueCard({
  clue,
  index,
  forensicsResult,
  isScanning,
  actionPoints,
  onAskForensics,
  onSelectForInterrogation,
}: ClueCardProps) {
  const hasForensics = Boolean(forensicsResult);

  return (
    <div className="relative bg-noir-900 border border-noir-800 hover:border-noir-700 rounded-lg p-4 transition-all duration-200 flex flex-col justify-between shadow-sm">
      {/* Evidence Tag Header */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-noir-800/80">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-typewriter font-bold bg-noir-800 text-amber-400 border border-amber-500/30">
              CLUE #{index + 1}
            </span>
            <span className="text-[10px] font-typewriter text-noir-500">
              EVID-TAG-{clue.id.toUpperCase()}
            </span>
          </div>
          {hasForensics && (
            <span className="flex items-center gap-1 text-[10px] font-typewriter text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              SCANNED
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-noir-100 font-sans mb-1.5 tracking-tight">
          {clue.name}
        </h3>

        <p className="text-xs text-noir-300 font-sans leading-relaxed mb-3">
          {clue.description}
        </p>

        {/* If Forensics scan results already present, display a quick summary */}
        {hasForensics && forensicsResult && (
          <div className="mt-2 mb-3 p-2.5 bg-noir-950 rounded border border-emerald-500/20 text-xs font-typewriter space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold uppercase">
                Relevance: {forensicsResult.relevance_score}%
              </span>
              <span className="text-noir-400 text-[10px]">
                {forensicsResult.possible_owners.join(", ")}
              </span>
            </div>
            <p className="text-noir-300 text-[11px] font-sans line-clamp-3">
              {forensicsResult.analysis}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-noir-800/60 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={() => {
            soundFX.playForensicsScan();
            onAskForensics(clue.id);
          }}
          disabled={isScanning || (!hasForensics && actionPoints < 2)}
          className={`px-3 py-1.5 rounded text-xs font-typewriter font-semibold flex items-center gap-1.5 transition ${
            hasForensics
              ? "bg-noir-800 hover:bg-noir-750 text-emerald-400 border border-emerald-500/30"
              : actionPoints < 2
              ? "bg-noir-850 text-noir-500 border border-noir-800 cursor-not-allowed"
              : "bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 shadow-sm"
          }`}
          title={
            hasForensics
              ? "View forensic laboratory report"
              : actionPoints < 2
              ? "Insufficient Action Points (requires 2 AP)"
              : "Analyze physical clue with AI Forensics (costs 2 AP)"
          }
        >
          <Search className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
          <span>
            {isScanning
              ? "Analyzing..."
              : hasForensics
              ? "View Lab Report"
              : "Forensic Scan (2 AP)"}
          </span>
        </button>

        {onSelectForInterrogation && (
          <button
            onClick={() => onSelectForInterrogation(clue.id)}
            className="text-[11px] font-typewriter text-amber-400/90 hover:text-amber-300 hover:underline transition"
          >
            Present in Room &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
