"use client";

import React, { useState } from "react";
import {
  Scale,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PublicSuspect, VerdictResult } from "@/types/mystery";
import { soundFX } from "@/lib/soundEffects";

interface VerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  suspects: PublicSuspect[];
  onSubmitVerdict: (
    accusedId: string,
    theory: string,
    motive: string,
    method: string
  ) => Promise<VerdictResult | null>;
  onNewMystery: () => void;
  onReattemptCase: () => void;
}

export function VerdictModal({
  isOpen,
  onClose,
  suspects,
  onSubmitVerdict,
  onNewMystery,
  onReattemptCase,
}: VerdictModalProps) {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(suspects[0]?.id || "");
  const [theory, setTheory] = useState("");
  const [motive, setMotive] = useState("");
  const [method, setMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdictResult, setVerdictResult] = useState<VerdictResult | null>(null);
  const [showTrueSolution, setShowTrueSolution] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspectId || !theory.trim() || isSubmitting) return;

    soundFX.playStamp();
    setIsSubmitting(true);
    setShowTrueSolution(false);

    try {
      const result = await onSubmitVerdict(
        selectedSuspectId,
        theory.trim(),
        motive.trim(),
        method.trim()
      );

      if (result) {
        setVerdictResult(result);
        soundFX.playStamp();

        if (result.is_correct) {
          // Trigger victory confetti
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setVerdictResult(null);
    setShowTrueSolution(false);
  };

  const handleReattempt = () => {
    soundFX.playPaperRustle();
    setVerdictResult(null);
    setShowTrueSolution(false);
    onReattemptCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-noir-900 border border-noir-700 rounded-lg shadow-2xl p-6 text-noir-100 font-typewriter max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-noir-400 hover:text-noir-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-noir-800 pb-3">
          <div className="w-8 h-8 rounded bg-red-950 border border-red-500/40 flex items-center justify-center text-red-500">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
              OFFICIAL ARREST WARRANT &amp; ACCUSATION
            </span>
            <h2 className="text-lg font-bold text-noir-100 font-sans tracking-tight">
              Chief of Police Verdict Review
            </h2>
          </div>
        </div>

        {/* If Verdict Result is received, show rubber stamp and Chief's review */}
        {verdictResult ? (
          <div className="space-y-6 text-center py-2">
            {/* Animated Rubber Stamp */}
            <div className="flex justify-center items-center py-4">
              <div
                className={`stamp-badge text-2xl font-black py-3 px-6 animate-stampIn ${
                  verdictResult.is_correct
                    ? "stamp-green border-4"
                    : "stamp-red border-4"
                }`}
              >
                {verdictResult.is_correct ? "CASE SOLVED" : "CASE DISMISSED"}
              </div>
            </div>

            {/* Score & Evaluation */}
            <div className="p-4 bg-noir-950 rounded-lg border border-noir-800 max-w-lg mx-auto text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-noir-850">
                <span className="text-xs uppercase text-noir-400 font-bold">
                  Chief Henderson&apos;s Assessment:
                </span>
                <span
                  className={`text-xl font-black ${
                    verdictResult.is_correct ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  Score: {verdictResult.score}%
                </span>
              </div>

              {verdictResult.breakdown && (
                <div className="grid grid-cols-3 gap-2 text-[11px] text-noir-300 py-1 border-b border-noir-850">
                  <div>
                    <span className="text-noir-500 block text-[9px] uppercase">Motive</span>
                    <span className="font-bold text-amber-400">{verdictResult.breakdown.motive_accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-noir-500 block text-[9px] uppercase">Method</span>
                    <span className="font-bold text-amber-400">{verdictResult.breakdown.method_accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-noir-500 block text-[9px] uppercase">Timeline</span>
                    <span className="font-bold text-amber-400">{verdictResult.breakdown.timeline_accuracy}%</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <span className="text-[10px] text-amber-500 uppercase font-bold block mb-1">
                  Chief Henderson&apos;s Review:
                </span>
                <p className="text-xs font-sans text-noir-200 leading-relaxed italic">
                  &quot;{verdictResult.feedback}&quot;
                </p>
              </div>

              {/* Reveal True Solution Spoiler-Free Toggle */}
              {verdictResult.true_solution && (
                <div className="pt-3 border-t border-noir-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowTrueSolution(!showTrueSolution)}
                      className="px-3 py-1.5 rounded bg-noir-900 hover:bg-noir-850 border border-noir-750 text-xs text-noir-300 hover:text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {showTrueSolution ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          <span>Hide True Solution</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reveal True Solution (Spoiler Warning)</span>
                        </>
                      )}
                    </button>
                    {!showTrueSolution && (
                      <span className="text-[10px] text-noir-500 italic">
                        Hidden by default so you can re-attempt!
                      </span>
                    )}
                  </div>

                  {showTrueSolution && (
                    <div className="p-3 bg-noir-900/90 rounded border border-amber-600/40 text-xs space-y-2 text-left font-sans animate-in fade-in duration-300">
                      <div className="flex items-center gap-1.5 text-amber-500 font-typewriter font-bold text-[11px] uppercase pb-1 border-b border-noir-800">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Confidential Case Solution Archive</span>
                      </div>
                      <div>
                        <strong className="text-amber-400 font-typewriter text-[11px] uppercase block">
                          True Killer:
                        </strong>
                        <span className="text-noir-100 font-semibold">
                          {verdictResult.true_solution.killer_name}
                        </span>
                      </div>
                      <div>
                        <strong className="text-amber-400 font-typewriter text-[11px] uppercase block">
                          True Motive:
                        </strong>
                        <p className="text-noir-200 text-xs">
                          {verdictResult.true_solution.motive}
                        </p>
                      </div>
                      <div>
                        <strong className="text-amber-400 font-typewriter text-[11px] uppercase block">
                          Murder Method &amp; Weapon:
                        </strong>
                        <p className="text-noir-200 text-xs">
                          {verdictResult.true_solution.method}
                        </p>
                      </div>
                      <div className="pt-1 border-t border-noir-800 text-[11px] text-noir-300 italic">
                        {verdictResult.true_solution.full_truth}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {/* Re-attempt Case button */}
              <button
                type="button"
                onClick={handleReattempt}
                className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-noir-950 text-xs uppercase transition font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
                title="Reset Action Points to 12 and start a fresh investigation of this case"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-attempt Case (Fresh 12 AP)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded bg-noir-800 hover:bg-noir-750 text-noir-200 text-xs uppercase transition font-bold cursor-pointer"
              >
                Edit Accusation Theory
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playTypewriter();
                  onClose();
                  onNewMystery();
                }}
                className="px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-noir-100 text-xs font-bold uppercase transition flex items-center gap-1.5 shadow-lg shadow-cyan-900/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Next Murder Mystery Case</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-sans text-noir-300 leading-relaxed">
              Carefully select the culprit from the lineup and lay out your theory. The Chief of Police will grade your deduction against the ground truth.
            </p>

            {/* Suspect Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-400 font-bold mb-2">
                1. Select the Killer:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {suspects.map((suspect) => {
                  const isSelected = selectedSuspectId === suspect.id;
                  return (
                    <button
                      key={suspect.id}
                      type="button"
                      onClick={() => setSelectedSuspectId(suspect.id)}
                      className={`p-3 rounded border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-red-950/50 border-red-500 text-red-200 ring-1 ring-red-500/60"
                          : "bg-noir-950 border-noir-800 text-noir-400 hover:border-noir-700 hover:text-noir-200"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-noir-100 font-sans">
                          {suspect.name}
                        </div>
                        <div className="text-[10px] text-amber-400/80">
                          {suspect.role}
                        </div>
                      </div>
                      <div className="mt-2 text-[9px] uppercase font-bold text-red-400">
                        {isSelected ? "ACCUSED OF HOMICIDE" : "CLICK TO ACCUSE"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motive & Method Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
                  2. Motive:
                </label>
                <input
                  type="text"
                  value={motive}
                  onChange={(e) => setMotive(e.target.value)}
                  placeholder="Why did they kill the victim?"
                  className="w-full px-3 py-2 bg-noir-950 border border-noir-750 rounded text-xs text-noir-100 placeholder-noir-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
                  3. Method &amp; Weapon:
                </label>
                <input
                  type="text"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="How was the murder committed?"
                  className="w-full px-3 py-2 bg-noir-950 border border-noir-750 rounded text-xs text-noir-100 placeholder-noir-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Detective's Full Theory */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
                4. Full Detective&apos;s Theory (Timeline, Clues, Proof):
              </label>
              <textarea
                rows={4}
                value={theory}
                onChange={(e) => setTheory(e.target.value)}
                placeholder="Detail how the evidence connects the killer to the crime scene, what occurred at specific times, and why other suspects are cleared..."
                className="w-full resize-none px-3 py-2 bg-noir-950 border border-noir-750 rounded text-xs text-noir-100 placeholder-noir-600 focus:outline-none focus:border-red-500 font-sans"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase text-noir-400 hover:text-noir-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSuspectId || !theory.trim() || isSubmitting}
                className="px-6 py-2.5 bg-red-700 hover:bg-red-600 disabled:bg-noir-800 disabled:text-noir-600 text-white font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 transition shadow-lg shadow-red-950/60 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>
                  {isSubmitting ? "Chief is Reviewing..." : "Submit Arrest Warrant"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
