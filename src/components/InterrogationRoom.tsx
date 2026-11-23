"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Pin,
  FileQuestion,
  User,
  ShieldAlert,
  Sparkles,
  Zap,
  CornerDownLeft,
  ChevronDown,
} from "lucide-react";
import { PublicSuspect, PublicClue, ChatMessage } from "@/types/mystery";
import { StressMeter } from "./StressMeter";
import { soundFX } from "@/lib/soundEffects";

interface InterrogationRoomProps {
  suspects: PublicSuspect[];
  clues: PublicClue[];
  activeSuspectId: string;
  onSelectSuspect: (suspectId: string) => void;
  chatHistories: Record<string, ChatMessage[]>;
  suspectNervousness: Record<string, number>;
  onSendMessage: (suspectId: string, message: string, presentedClueId?: string) => Promise<void>;
  onPinQuote: (suspectName: string, quote: string) => void;
  actionPoints: number;
  isLoading: boolean;
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
}

export function InterrogationRoom({
  suspects,
  clues,
  activeSuspectId,
  onSelectSuspect,
  chatHistories,
  suspectNervousness,
  onSendMessage,
  onPinQuote,
  actionPoints,
  isLoading,
  prefilledPrompt,
  onClearPrefilledPrompt,
}: InterrogationRoomProps) {
  const [inputText, setInputText] = useState("");
  const [selectedClueId, setSelectedClueId] = useState<string>("");
  const [showClueDropdown, setShowClueDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSuspect = suspects.find((s) => s.id === activeSuspectId) || suspects[0];
  const messages = chatHistories[activeSuspect?.id] || [];
  const currentNervousness = suspectNervousness[activeSuspect?.id] || 20;

  // Sync prefilled prompt if coming from forensics or quick clue
  useEffect(() => {
    if (prefilledPrompt) {
      setInputText(prefilledPrompt);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt, onClearPrefilledPrompt]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    if (actionPoints <= 0) return;

    soundFX.playTypewriter();
    const textToSend = inputText.trim();
    const clueToPresent = selectedClueId || undefined;

    setInputText("");
    setSelectedClueId("");
    setShowClueDropdown(false);

    await onSendMessage(activeSuspect.id, textToSend, clueToPresent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedClue = clues.find((c) => c.id === selectedClueId);

  return (
    <div className="bg-noir-900 border border-noir-750 rounded-lg shadow-dossier flex flex-col h-[650px] overflow-hidden">
      {/* Top Bar: Suspect Tabs */}
      <div className="flex border-b border-noir-800 bg-noir-950/80 px-2 pt-2 gap-1 overflow-x-auto">
        {suspects.map((suspect) => {
          const isActive = suspect.id === activeSuspect?.id;
          const stress = suspectNervousness[suspect.id] || 20;
          return (
            <button
              key={suspect.id}
              onClick={() => {
                soundFX.playPaperRustle();
                onSelectSuspect(suspect.id);
              }}
              className={`px-4 py-2 text-xs font-typewriter font-semibold rounded-t flex items-center gap-2 border-t border-x transition shrink-0 ${
                isActive
                  ? "bg-noir-900 text-amber-400 border-noir-700 border-b-transparent shadow-md"
                  : "bg-noir-950 text-noir-400 border-transparent hover:text-noir-200 hover:bg-noir-900/50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{suspect.name}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  stress >= 75
                    ? "bg-rose-950 text-rose-400"
                    : stress >= 45
                    ? "bg-amber-950 text-amber-400"
                    : "bg-emerald-950 text-emerald-400"
                }`}
              >
                {stress}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Suspect Header & Stress / Pulse Monitor */}
      <div className="p-3 bg-noir-950/60 border-b border-noir-800 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-typewriter text-amber-500 uppercase tracking-widest">
              Interrogation Chamber • Line 1
            </div>
            <div className="text-sm font-bold text-noir-100 flex items-center gap-2">
              <span>{activeSuspect?.name}</span>
              <span className="text-xs text-noir-400 font-normal">
                ({activeSuspect?.role})
              </span>
            </div>
          </div>
          <div className="text-right text-[11px] font-typewriter text-noir-400">
            Bio: <span className="text-noir-300 italic">{activeSuspect?.public_bio}</span>
          </div>
        </div>

        {/* Live Heartbeat / Stress Pulse Meter */}
        <StressMeter
          nervousness={currentNervousness}
          suspectName={activeSuspect?.name || "Suspect"}
        />
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-noir-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-noir-400 space-y-3 font-typewriter">
            <div className="w-12 h-12 rounded-full bg-noir-850 border border-noir-750 flex items-center justify-center text-amber-500/60">
              <FileQuestion className="w-6 h-6" />
            </div>
            <p className="text-xs max-w-sm leading-relaxed">
              {activeSuspect?.name} sits under the harsh overhead lamp. Ask questions, confront them with crime scene clues, and observe their pulse and reactions.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <button
                onClick={() =>
                  setInputText(`Where were you tonight around 11:00 PM when Julian was killed?`)
                }
                className="px-2.5 py-1 text-[11px] rounded bg-noir-850 hover:bg-noir-800 border border-noir-750 text-noir-300 hover:text-noir-100 transition"
              >
                &quot;Where were you around 11:00 PM?&quot;
              </button>
              <button
                onClick={() =>
                  setInputText(`What was your exact relationship with Julian Vance?`)
                }
                className="px-2.5 py-1 text-[11px] rounded bg-noir-850 hover:bg-noir-800 border border-noir-750 text-noir-300 hover:text-noir-100 transition"
              >
                &quot;What was your relationship with Julian?&quot;
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-typewriter text-noir-500">
                  <span>{isUser ? "DETECTIVE" : activeSuspect?.name.toUpperCase()}</span>
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {!isUser && typeof msg.nervousness === "number" && (
                    <span className="text-amber-500 font-bold ml-1">
                      [Pulse: {msg.nervousness}%]
                    </span>
                  )}
                </div>

                <div
                  className={`group relative max-w-[85%] rounded-lg p-3.5 text-xs font-sans leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-amber-600/90 text-noir-950 font-medium rounded-tr-none"
                      : "bg-noir-850 border border-noir-750 text-noir-100 rounded-tl-none font-typewriter"
                  }`}
                >
                  {/* Presented Clue Tag highlight */}
                  {msg.presentedClueName && (
                    <div className="mb-2 p-1.5 rounded bg-amber-950/60 border border-amber-500/40 text-[10px] font-typewriter text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>CONFRONTED WITH: {msg.presentedClueName}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Pin Quote to Notebook Button (for Assistant responses) */}
                  {!isUser && (
                    <button
                      onClick={() => {
                        soundFX.playStamp();
                        onPinQuote(activeSuspect?.name || "Suspect", msg.content);
                      }}
                      className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition p-1.5 rounded bg-noir-800 hover:bg-amber-500 hover:text-noir-950 text-noir-400 border border-noir-700 shadow"
                      title="Pin this suspect statement to Detective Notebook"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[10px] font-typewriter text-noir-500 px-1">
              {activeSuspect?.name.toUpperCase()} IS REACTING...
            </span>
            <div className="p-3 bg-noir-850 border border-noir-750 rounded-lg text-xs font-typewriter text-noir-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Analyzing question &amp; calculating pulse reaction...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Evidence Presentation Selector Banner */}
      {selectedClue && (
        <div className="px-4 py-2 bg-amber-950/40 border-t border-amber-500/30 flex items-center justify-between text-xs font-typewriter text-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Evidence Attached: <strong>{selectedClue.name}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedClueId("")}
            className="text-[11px] text-amber-400/80 hover:text-amber-200 underline"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-3 bg-noir-950 border-t border-noir-800 space-y-2">
        {actionPoints <= 0 && (
          <div className="p-2 bg-rose-950/60 border border-rose-500/50 rounded text-rose-300 text-xs font-typewriter flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              OUT OF ACTION POINTS! You cannot conduct further interrogations without action points. Proceed to Accuse Suspect or start a New Mystery.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Present Clue Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowClueDropdown(!showClueDropdown)}
              disabled={isLoading || actionPoints <= 0}
              className={`px-3 py-2.5 rounded text-xs font-typewriter border flex items-center gap-1.5 transition ${
                selectedClueId
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-noir-900 hover:bg-noir-850 text-noir-300 hover:text-noir-100 border-noir-750"
              }`}
              title="Present a piece of evidence during your question"
            >
              <span>Present Clue</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showClueDropdown && (
              <div className="absolute bottom-full mb-1 left-0 w-64 bg-noir-900 border border-noir-700 rounded-md shadow-2xl p-1 z-30 space-y-1">
                <div className="px-2 py-1 text-[10px] font-typewriter uppercase text-amber-500 font-bold border-b border-noir-800">
                  Physical Evidence to Present
                </div>
                {clues.map((clue) => (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => {
                      setSelectedClueId(clue.id);
                      setShowClueDropdown(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-typewriter hover:bg-noir-800 transition ${
                      selectedClueId === clue.id
                        ? "text-amber-400 font-bold bg-noir-850"
                        : "text-noir-200"
                    }`}
                  >
                    <div className="font-semibold">{clue.name}</div>
                    <div className="text-[10px] text-noir-400 line-clamp-1">
                      {clue.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text input area */}
          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || actionPoints <= 0}
              placeholder={
                actionPoints <= 0
                  ? "Action points depleted..."
                  : `Question ${activeSuspect?.name} (Costs 1 AP)...`
              }
              className="w-full resize-none px-3 py-2 bg-noir-900 border border-noir-750 rounded text-xs text-noir-100 placeholder-noir-500 focus:outline-none focus:border-amber-500 font-typewriter"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || actionPoints <= 0}
            className="h-14 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-noir-800 text-noir-950 disabled:text-noir-500 font-typewriter font-bold text-xs uppercase tracking-wider rounded flex flex-col items-center justify-center gap-0.5 transition shadow-sm disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="text-[9px] flex items-center gap-0.5">
              1 AP <Zap className="w-2.5 h-2.5 inline" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
