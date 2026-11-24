"use client";

import React, { useState } from "react";
import { AlertTriangle, RotateCcw, X, ShieldAlert, Check } from "lucide-react";
import { soundFX } from "@/lib/soundEffects";

interface ResetAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => Promise<void>;
}

export function ResetAppModal({
  isOpen,
  onClose,
  onConfirmReset,
}: ResetAppModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isResetting) return;
    setStep(1);
    onClose();
  };

  const handleProceedToStep2 = () => {
    soundFX.playPaperRustle();
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    setIsResetting(true);
    soundFX.playStamp();
    try {
      await onConfirmReset();
    } finally {
      setIsResetting(false);
      setStep(1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm pointer-events-auto">
      <div className="bg-noir-900 border-2 border-rose-600/70 rounded-lg w-[94vw] max-w-lg shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-950/80 border-b border-rose-800/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-rose-900/60 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-[10px] font-typewriter uppercase tracking-widest text-rose-400 font-bold">
                PRECINCT ARCHIVE SYSTEM PURGE
              </div>
              <h2 className="text-base font-bold font-typewriter text-white">
                {step === 1 ? "Step 1: Confirm Full App Reset" : "Step 2: Irreversible Archive Wipe"}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isResetting}
            className="p-1 rounded text-rose-300 hover:text-white hover:bg-rose-900/40 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs font-sans leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Are you sure you want to reset the entire app? This will permanently erase all case history, attempt logs, notebook notes, detective rank, and tour progress.
                </span>
              </div>

              <div className="text-xs font-typewriter text-noir-300 space-y-1.5 pl-2 border-l-2 border-noir-750">
                <p>• Erases all archived cases &amp; custom generated mysteries.</p>
                <p>• Resets active mystery to the starter case (&quot;Murder at the Midnight Gala&quot;).</p>
                <p>• Clears all pinned quotes and investigative notes.</p>
                <p>• Restores Action Points budget back to 12 AP.</p>
                <p className="text-amber-400 font-semibold">
                  (Note: Your custom Groq API key will be safely preserved.)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded bg-rose-950/70 border-2 border-rose-500/60 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto animate-bounce" />
                <h3 className="text-sm font-bold font-typewriter text-rose-200 uppercase tracking-wider">
                  FINAL VERIFICATION REQUIRED
                </h3>
                <p className="text-xs text-rose-300 font-sans leading-relaxed">
                  This action cannot be undone. All investigation logs, case outcomes, and timeline notes will be immediately purged from local memory and reset to ground zero.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-noir-950 border-t border-noir-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isResetting}
            className="px-4 py-2 rounded text-xs font-typewriter font-semibold text-noir-300 hover:text-white bg-noir-850 hover:bg-noir-800 border border-noir-750 transition cursor-pointer"
          >
            Cancel
          </button>

          {step === 1 ? (
            <button
              type="button"
              onClick={handleProceedToStep2}
              className="px-4 py-2 rounded text-xs font-typewriter font-bold uppercase tracking-wider text-white bg-rose-700 hover:bg-rose-600 border border-rose-500 shadow-md shadow-rose-950 transition cursor-pointer flex items-center gap-2"
            >
              <span>Continue to Step 2</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalConfirm}
              disabled={isResetting}
              className="px-4 py-2 rounded text-xs font-typewriter font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 border border-red-400 shadow-lg shadow-red-950 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Purging Files..." : "Yes, Reset Everything"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
