"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  BookOpen,
  Scale,
  Sparkles,
  Key,
  FolderLock,
  HelpCircle,
  RotateCcw,
  MoreVertical,
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
  onOpenResetApp?: () => void;
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
  onOpenResetApp,
}: HeaderProps) {
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSound = () => {
    soundFX.enabled = !soundFX.enabled;
    setMuted(!soundFX.enabled);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsOpen]);

  return (
    <header className="sticky top-0 z-40 bg-noir-950/95 border-b border-noir-800 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 shadow-md pointer-events-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
        
        {/* ROW 1 on mobile: Title + Settings + Accuse Suspect */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
              <FolderLock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] tracking-widest font-typewriter uppercase text-amber-500 font-bold">
                  Homicide Division • Precinct 12
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold font-typewriter text-noir-100 tracking-tight truncate flex items-center gap-1.5">
                <span>THE DETECTIVE&apos;S DESK</span>
                <span className="text-[11px] font-normal text-amber-300/80 font-sans truncate hidden md:inline">
                  &bull; &quot;{caseTitle}&quot;
                </span>
              </h1>
            </div>
          </div>

          {/* Mobile Right Controls: Settings + Accuse */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {/* Settings Trigger on Mobile */}
            <div className="relative" ref={dropdownRef}>
              <button
                data-tour="settings-menu-btn"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-1.5 rounded bg-noir-900 border border-noir-750 text-noir-300 hover:text-noir-100 hover:border-noir-600 transition cursor-pointer"
                title="Precinct Settings & Utilities"
                aria-label="Settings"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-noir-900 border border-noir-700 rounded-lg shadow-2xl p-1 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      toggleSound();
                      setSettingsOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs font-typewriter flex items-center gap-2 hover:bg-noir-800 text-noir-200 transition"
                  >
                    {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-noir-400" />}
                    <span>{muted ? "Unmute Audio FX" : "Mute Audio FX"}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenApiKeyModal();
                      setSettingsOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs font-typewriter flex items-center gap-2 hover:bg-noir-800 text-noir-200 transition"
                  >
                    <Key className={`w-3.5 h-3.5 ${hasCustomKey ? "text-amber-400" : "text-noir-400"}`} />
                    <span>API Key Clearance</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFX.playPaperRustle();
                      onStartTour();
                      setSettingsOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs font-typewriter flex items-center gap-2 hover:bg-noir-800 text-amber-300 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Replay Guide</span>
                  </button>

                  {onOpenResetApp && (
                    <div className="pt-1 border-t border-noir-800">
                      <button
                        onClick={() => {
                          soundFX.playPaperRustle();
                          onOpenResetApp();
                          setSettingsOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded text-xs font-typewriter flex items-center gap-2 hover:bg-rose-950/60 text-rose-400 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset App State</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Accuse Button */}
            <button
              data-tour="accuse-btn"
              onClick={() => {
                soundFX.playStamp();
                onOpenVerdict();
              }}
              className="px-2.5 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-typewriter font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 transition shadow-md shadow-red-950/50 border border-red-500 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Accuse</span>
            </button>
          </div>
        </div>

        {/* ROW 2 on mobile / Desktop Controls: AP + Notebook + New Mystery + Accuse + Settings */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* AP Badge (Compact & Responsive) */}
          <ActionPointsBadge points={actionPoints} dataTour="action-points" />

          {/* Detective Notebook */}
          <button
            data-tour="notebook-btn"
            onClick={() => {
              soundFX.playPaperRustle();
              onOpenNotebook();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded bg-noir-850 hover:bg-noir-800 border border-noir-700 hover:border-noir-600 text-xs font-typewriter flex items-center gap-1.5 sm:gap-2 text-noir-200 transition shadow-sm relative cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Notebook</span>
            {notebookNotesCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-noir-950 font-bold rounded-full">
                {notebookNotesCount}
              </span>
            )}
          </button>

          {/* New Mystery Generator */}
          <button
            data-tour="new-mystery-btn"
            onClick={() => {
              soundFX.playTypewriter();
              onGenerateNewCase();
            }}
            disabled={isGeneratingCase}
            className="px-2.5 sm:px-3 py-1.5 rounded bg-noir-850 hover:bg-noir-800 border border-noir-700 hover:border-cyan-500/50 text-xs font-typewriter flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition disabled:opacity-50 cursor-pointer"
            title="Generate a brand-new solvable murder mystery using gpt-oss-120b"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCase ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden xs:inline">
              {isGeneratingCase ? "Drafting..." : "New Mystery"}
            </span>
          </button>

          {/* Desktop Accuse Suspect Button */}
          <button
            onClick={() => {
              soundFX.playStamp();
              onOpenVerdict();
            }}
            className="hidden sm:flex px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-typewriter font-bold text-xs uppercase tracking-wider items-center gap-1.5 transition shadow-lg shadow-red-950/50 hover:shadow-red-900/80 border border-red-500 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Accuse Suspect</span>
          </button>

          {/* Desktop Settings / More Dropdown */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              data-tour="settings-menu-btn"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-1.5 rounded bg-noir-900 border border-noir-750 text-noir-300 hover:text-noir-100 hover:border-noir-600 transition cursor-pointer"
              title="Precinct Settings & Utilities (Sound, API Key, Guide, Reset)"
              aria-label="Settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-noir-900 border border-noir-700 rounded-lg shadow-2xl p-1 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    toggleSound();
                    setSettingsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-xs font-typewriter flex items-center gap-2.5 hover:bg-noir-800 text-noir-200 transition"
                >
                  {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-noir-400" />}
                  <span>{muted ? "Unmute Noir Audio FX" : "Mute Noir Audio FX"}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenApiKeyModal();
                    setSettingsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-xs font-typewriter flex items-center gap-2.5 hover:bg-noir-800 text-noir-200 transition"
                >
                  <Key className={`w-4 h-4 ${hasCustomKey ? "text-amber-400" : "text-noir-400"}`} />
                  <span>API Key Clearance</span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playPaperRustle();
                    onStartTour();
                    setSettingsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-xs font-typewriter flex items-center gap-2.5 hover:bg-noir-800 text-amber-300 transition"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Interactive Walkthrough</span>
                </button>

                {onOpenResetApp && (
                  <div className="pt-1 mt-1 border-t border-noir-800">
                    <button
                      onClick={() => {
                        soundFX.playPaperRustle();
                        onOpenResetApp();
                        setSettingsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-xs font-typewriter flex items-center gap-2.5 hover:bg-rose-950/60 text-rose-400 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Precinct App</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
