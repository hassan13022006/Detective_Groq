"use client";

import React from "react";
import {
  Archive,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Skull,
  Award,
  ChevronRight,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { CaseArchiveItem } from "@/types/mystery";
import { soundFX } from "@/lib/soundEffects";

interface CaseHistorySectionProps {
  caseHistory: CaseArchiveItem[];
  activeCaseId: string;
  onReattemptCase: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
}

export function CaseHistorySection({
  caseHistory,
  activeCaseId,
  onReattemptCase,
  onDeleteCase,
}: CaseHistorySectionProps) {
  return (
    <section
      data-tour="case-history"
      className="mt-10 p-5 bg-noir-900 border border-noir-800 rounded-lg shadow-dossier space-y-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-noir-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-typewriter text-amber-500 font-bold uppercase tracking-widest">
              PRECINCT COLD &amp; ACTIVE CASE ARCHIVE
            </div>
            <h2 className="text-sm sm:text-base font-bold font-sans text-noir-100 tracking-tight">
              Case History &amp; Attempt Log
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-typewriter text-noir-400">
          <span className="px-2 py-0.5 rounded bg-noir-850 border border-noir-750 text-noir-300">
            Total Cases: <strong className="text-amber-400">{caseHistory.length}</strong>
          </span>
        </div>
      </div>

      <p className="text-xs text-noir-300 font-sans leading-relaxed">
        Every mystery you investigate, attempt record, and score percentage is archived here. You can re-attempt any case anytime with a fresh 12-AP budget without spoiling the true culprit unless you choose to reveal the solution.
      </p>

      {/* Case List in Numbered Order */}
      <div className="space-y-4 pt-1">
        {caseHistory.map((item, index) => {
          const isActive = item.case_id === activeCaseId;
          const hasSuccess = item.attempts.some((a) => a.is_correct);
          const hasAttempts = item.attempts.length > 0;

          return (
            <div
              key={item.case_id}
              className={`p-4 rounded-lg border transition-all ${
                isActive
                  ? "bg-noir-850/90 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md"
                  : "bg-noir-950/60 border-noir-800 hover:border-noir-700"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-noir-850">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-typewriter text-xs font-bold text-amber-500">
                      {index + 1}. {item.case_title}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-typewriter uppercase bg-amber-950/80 text-amber-300 border border-amber-500/40">
                        Active Case
                      </span>
                    )}
                    {hasSuccess ? (
                      <span className="stamp-badge text-[9px] py-0.5 px-2 stamp-green">
                        SOLVED
                      </span>
                    ) : hasAttempts ? (
                      <span className="stamp-badge text-[9px] py-0.5 px-2 stamp-red">
                        UNSOLVED ({item.attempts.length} ATTEMPTS)
                      </span>
                    ) : (
                      <span className="text-[10px] font-typewriter text-noir-400 px-2 py-0.5 rounded bg-noir-800">
                        IN PROGRESS
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-sans text-noir-400 flex items-center gap-2 mt-1">
                    <Skull className="w-3 h-3 text-rose-500/70" />
                    <span>
                      Victim: <strong className="text-noir-200">{item.case_data.victim.name}</strong> ({item.case_data.victim.role})
                    </span>
                  </div>
                </div>

                {/* Actions: Re-attempt & Delete */}
                <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playPaperRustle();
                      onReattemptCase(item.case_id);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-typewriter font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isActive
                        ? "bg-amber-600 hover:bg-amber-500 text-noir-950 font-bold shadow-sm"
                        : "bg-noir-800 hover:bg-noir-750 text-noir-200 hover:text-amber-300 border border-noir-700"
                    }`}
                    title="Reload this case into active investigation with 12 fresh Action Points"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isActive ? "Re-attempt Case" : "Switch & Re-attempt"}</span>
                  </button>

                  {onDeleteCase && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playPaperRustle();
                        onDeleteCase(item.case_id);
                      }}
                      className="p-1.5 rounded bg-noir-800 hover:bg-rose-950/60 text-noir-400 hover:text-rose-400 border border-noir-700 hover:border-rose-800/60 transition cursor-pointer"
                      title="Permanently remove this case record from archive"
                      aria-label={`Delete ${item.case_title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Attempt History Log */}
              <div className="pt-3">
                <div className="text-[10px] font-typewriter uppercase tracking-wider text-noir-500 font-bold mb-1.5">
                  Investigation Attempt Log:
                </div>
                {item.attempts.length === 0 ? (
                  <div className="text-xs font-typewriter text-noir-500 italic pl-2 border-l border-noir-800">
                    • No formal accusation submitted yet. Crime scene investigation in progress.
                  </div>
                ) : (
                  <div className="space-y-1.5 pl-2 border-l border-noir-800">
                    {item.attempts.map((attempt) => (
                      <div
                        key={attempt.attempt_number}
                        className="text-xs font-typewriter flex items-center justify-between text-noir-300 flex-wrap gap-2"
                      >
                        <div className="flex items-center gap-2">
                          {attempt.is_correct ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>
                            Attempt {attempt.attempt_number}:{" "}
                            <strong
                              className={
                                attempt.is_correct
                                  ? "text-emerald-400 font-bold"
                                  : "text-rose-400"
                              }
                            >
                              {attempt.is_correct ? "Success" : "Failed"}
                            </strong>{" "}
                            (Score: {attempt.score}%)
                          </span>
                          <span className="text-noir-500 text-[11px]">
                            • Accused: {attempt.accused_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-noir-500 font-sans">
                          {new Date(attempt.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {new Date(attempt.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
