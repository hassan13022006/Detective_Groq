"use client";

import React, { useState } from "react";
import {
  BookOpen,
  X,
  Plus,
  Trash2,
  Pin,
  Clock,
  Sparkles,
} from "lucide-react";
import { NotebookEntry } from "@/types/mystery";
import { soundFX } from "@/lib/soundEffects";

interface NotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: NotebookEntry[];
  onAddEntry: (text: string) => void;
  onDeleteEntry: (id: string) => void;
}

export function NotebookDrawer({
  isOpen,
  onClose,
  entries,
  onAddEntry,
  onDeleteEntry,
}: NotebookDrawerProps) {
  const [newNoteText, setNewNoteText] = useState("");

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    soundFX.playTypewriter();
    onAddEntry(newNoteText.trim());
    setNewNoteText("");
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-noir-900 border-l border-noir-800 shadow-2xl flex flex-col font-typewriter max-h-[100dvh]">
      {/* Drawer Header */}
      <div className="p-4 bg-noir-950 border-b border-noir-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm tracking-wider text-noir-100 uppercase">
            Detective&apos;s Field Notebook
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-noir-400 hover:text-noir-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Note Form */}
      <form onSubmit={handleAdd} className="p-3 border-b border-noir-800 bg-noir-900/60">
        <label className="block text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-1">
          Record Clue or Hypothesis:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="e.g., Marcus was near the kitchen at 11:05..."
            className="flex-1 px-3 py-2 bg-noir-950 border border-noir-750 rounded text-xs text-noir-100 placeholder-noir-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!newNoteText.trim()}
            className="px-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-noir-950 font-bold rounded flex items-center justify-center transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-noir-500 space-y-2">
            <BookOpen className="w-8 h-8 opacity-40 text-amber-500" />
            <p className="text-xs">Your notebook is empty.</p>
            <p className="text-[11px] text-noir-600 leading-relaxed font-sans">
              Type hypotheses above or click the <Pin className="w-3 h-3 inline mx-0.5 text-amber-400" /> pin icon on any suspect message to bookmark damning quotes.
            </p>
          </div>
        ) : (
          entries.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded border text-xs leading-relaxed relative group transition ${
                note.pinnedQuote
                  ? "bg-amber-950/20 border-amber-500/30 text-amber-100"
                  : "bg-noir-950 border-noir-800 text-noir-200"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-noir-400 mb-1">
                {note.pinnedQuote ? (
                  <span className="flex items-center gap-1 text-amber-400 font-bold uppercase tracking-wider">
                    <Pin className="w-3 h-3" />
                    Pinned from {note.pinnedQuote.suspectName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-noir-500" />
                    {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                <button
                  onClick={() => {
                    soundFX.playPaperRustle();
                    onDeleteEntry(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-noir-500 hover:text-rose-400 transition"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {note.pinnedQuote ? (
                <div className="font-sans italic border-l-2 border-amber-500/60 pl-2 text-noir-200 text-xs">
                  &quot;{note.pinnedQuote.quote}&quot;
                </div>
              ) : (
                <div className="font-sans text-noir-100 whitespace-pre-wrap">
                  {note.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
