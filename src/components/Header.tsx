"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  BookOpen,
  Scale,
  Sparkles,
  Key,
  FolderLock,
  HelpCircle,
} from "lucide-react";
import { ActionPointsBadge } from "./ActionPointsBadge";
import { soundFX } from "@/lib/soundEffects";

interface HeaderProps {
  caseTitle: string;
  actionPoints: number;
  onOpenNotebook: () => void;
  onOpenVerdict: () => void;
  onGenerateNewCase: () => void;
  onOpenApiKeyModal: () => void;
  onStartTour: () => void;
  notebookNotesCount: number;
  isGeneratingCase: boolean;
  hasCustomKey: boolean;
}

export function Header({
  caseTitle,
  actionPoints,
  onOpenNotebook,
  onOpenVerdict,
  onGenerateNewCase,
  onOpenApiKeyModal,
  onStartTour,
  notebookNotesCount,
  isGeneratingCase,
  hasCustomKey,
}: HeaderProps) {
  const [muted, setMuted] = useState(false);

  const toggleSound = () => {
    soundFX.enabled = !soundFX.enabled;
    setMuted(!soundFX.enabled);
  };

  return (
    <header className="sticky top-0 z-40 bg-noir-950/95 border-b border-noir-800 backdrop-blur-md px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title & Police Precinct Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-inner">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-typewriter uppercase text-amber-500 font-bold">
                  Homicide Division • Precinct 12
                </span>
                <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 bg-noir-800 text-noir-400 font-typewriter rounded">
                  CASE DOSSIER #4092-B
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-typewriter text-noir-100 tracking-tight flex items-center gap-2">
                THE DETECTIVE&apos;S DESK
                <span className="text-xs font-normal text-noir-400 font-sans hidden lg:inline">
                  | &quot;{caseTitle}&quot;
                </span>
              </h1>
            </div>
          </div>

          <div className="md:hidden">
            <ActionPointsBadge points={actionPoints} />
          </div>
        </div>

        {/* Action Points & Control Center */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end flex-wrap">
          <div className="hidden md:block">
            <ActionPointsBadge points={actionPoints} />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded bg-noir-900 border border-noir-750 text-noir-300 hover:text-noir-100 hover:border-noir-600 transition"
            title={muted ? "Unmute noir audio FX" : "Mute audio FX"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-noir-300" />}
          </button>

          {/* API Key settings */}
          <button
            onClick={onOpenApiKeyModal}
            className={`px-2.5 py-1.5 rounded text-xs font-typewriter flex items-center gap-1.5 border transition ${
              hasCustomKey
                ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                : "bg-noir-900 border-noir-750 text-noir-400 hover:text-noir-200"
            }`}
            title="Configure Groq API Key clearance"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          {/* Detective Notebook Drawer Trigger */}
          <button
            data-tour="notebook-btn"
            onClick={() => {
              soundFX.playPaperRustle();
              onOpenNotebook();
            }}
            className="px-3 py-1.5 rounded bg-noir-850 hover:bg-noir-800 border border-noir-700 hover:border-noir-600 text-xs font-typewriter flex items-center gap-2 text-noir-200 transition shadow-sm relative"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Notebook</span>
            {notebookNotesCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-noir-950 font-bold rounded-full">
                {notebookNotesCount}
              </span>
            )}
          </button>

          {/* Interactive Guide / Onboarding Walkthrough Trigger */}
          <button
            onClick={() => {
              soundFX.playPaperRustle();
              onStartTour();
            }}
            className="px-2.5 py-1.5 rounded bg-noir-850 hover:bg-noir-800 border border-noir-700 hover:border-amber-500/50 text-xs font-typewriter flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition shadow-sm"
            title="Replay Interactive Detective Walkthrough"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* New Mystery Generator Button */}
          <button
            data-tour="new-mystery-btn"
            onClick={() => {
              soundFX.playTypewriter();
              onGenerateNewCase();
            }}
            disabled={isGeneratingCase}
            className="px-3 py-1.5 rounded bg-noir-850 hover:bg-noir-800 border border-noir-700 hover:border-cyan-500/50 text-xs font-typewriter flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition disabled:opacity-50"
            title="Generate a brand-new solvable murder mystery using gpt-oss-120b"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCase ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">
              {isGeneratingCase ? "Drafting Case..." : "New Mystery"}
            </span>
          </button>

          {/* Accuse Suspect Final Verdict Trigger */}
          <button
            data-tour="accuse-btn"
            onClick={() => {
              soundFX.playStamp();
              onOpenVerdict();
            }}
            className="px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-typewriter font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-red-950/50 hover:shadow-red-900/80 border border-red-500"
          >
            <Scale className="w-4 h-4" />
            <span>Accuse Suspect</span>
          </button>
        </div>
      </div>
    </header>
  );
}
