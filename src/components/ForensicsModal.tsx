"use client";

import React from "react";
import { Search, X, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { PublicClue, ForensicsResult } from "@/types/mystery";
import { soundFX } from "@/lib/soundEffects";

interface ForensicsModalProps {
  clue: PublicClue | null;
  result: ForensicsResult | null;
  isOpen: boolean;
  onClose: () => void;
  onUseFollowupInInterrogation: (question: string) => void;
}

export function ForensicsModal({
  clue,
  result,
  isOpen,
  onClose,
  onUseFollowupInInterrogation,
}: ForensicsModalProps) {
  if (!isOpen || !clue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-noir-900 border border-cyan-500/40 rounded-lg shadow-2xl p-6 text-noir-100 font-typewriter">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-noir-400 hover:text-noir-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 text-cyan-400 border-b border-noir-800 pb-3">
          <Search className="w-5 h-5" />
          <div>
            <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">
              POLICE FORENSICS LABORATORY REPORT
            </span>
            <h3 className="text-base font-bold text-noir-100 font-sans tracking-tight">
              {clue.name}
            </h3>
          </div>
        </div>

        {/* Clue Details */}
        <div className="p-3 bg-noir-950 rounded border border-noir-800 mb-4 text-xs font-sans text-noir-300">
          <span className="text-[10px] font-typewriter text-noir-400 uppercase font-bold block mb-1">
            Evidence Description:
          </span>
          {clue.description}
        </div>

        {/* Forensic Results */}
        {result ? (
          <div className="space-y-4">
            {/* Relevance Score & Suspect Associations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-noir-950/80 rounded border border-cyan-500/30">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">
                  Relevance Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-cyan-300">
                    {result.relevance_score}
                  </span>
                  <span className="text-xs text-noir-400">/ 100</span>
                </div>
              </div>

              <div className="p-3 bg-noir-950/80 rounded border border-noir-800">
                <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                  Possible Owner / Tie
                </span>
                <div className="text-xs text-noir-200 font-sans font-semibold">
                  {result.possible_owners && result.possible_owners.length > 0
                    ? result.possible_owners.join(", ")
                    : "No singular match"}
                </div>
              </div>
            </div>

            {/* Scientific Analysis */}
            <div className="p-3 bg-noir-950 rounded border border-noir-800 space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                Pathology &amp; Lab Analysis:
              </span>
              <p className="text-xs font-sans text-noir-200 leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* Recommended Follow-up Question */}
            <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Recommended Interrogation Line:</span>
              </div>
              <p className="text-xs font-typewriter text-amber-200 italic">
                &quot;{result.followup_question}&quot;
              </p>
              <button
                onClick={() => {
                  soundFX.playTypewriter();
                  onUseFollowupInInterrogation(result.followup_question);
                  onClose();
                }}
                className="mt-2 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-noir-950 font-bold text-xs uppercase rounded flex items-center justify-center gap-1.5 transition"
              >
                <span>Confront Suspect in Interrogation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-noir-400 text-xs">
            Scan in progress or report unavailable.
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-noir-800 hover:bg-noir-750 text-noir-300 text-xs uppercase rounded transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
