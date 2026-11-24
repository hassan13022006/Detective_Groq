"use client";

import React, { useState, useEffect } from "react";
import { Key, ShieldAlert, Check, X } from "lucide-react";
import { soundFX } from "@/lib/soundEffects";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }: ApiKeyModalProps) {
  const [inputVal, setInputVal] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInputVal(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    soundFX.playStamp();
    onSaveKey(inputVal.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-[94vw] max-w-lg bg-noir-900 border border-amber-600/40 rounded-lg shadow-2xl p-4 sm:p-6 text-noir-100 max-h-[85dvh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-noir-400 hover:text-noir-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-amber-500">
          <Key className="w-5 h-5" />
          <h3 className="font-typewriter text-lg font-bold tracking-wider uppercase">
            Detective Clearance / API Key
          </h3>
        </div>

        <p className="text-xs text-noir-300 font-sans leading-relaxed mb-4">
          The detective terminal communicates directly with the Groq LLM API (<code className="text-amber-400">openai/gpt-oss-120b</code> &amp; <code className="text-amber-400">openai/gpt-oss-20b</code>).
          If <code className="text-amber-300">GROQ_API_KEY</code> is set in your server <code className="text-noir-200">.env.local</code>, you can leave this empty.
        </p>

        <div className="space-y-3 mb-6">
          <label className="block text-xs font-typewriter uppercase tracking-wider text-noir-300">
            Groq API Key (gsk_...)
          </label>
          <input
            type="password"
            placeholder="gsk_..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full px-3 py-2 bg-noir-950 border border-noir-700 rounded text-sm text-noir-100 focus:outline-none focus:border-amber-500 font-typewriter"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-typewriter uppercase text-noir-400 hover:text-noir-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-noir-950 font-bold font-typewriter text-xs uppercase rounded flex items-center gap-1.5 transition shadow-lg shadow-amber-900/30"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                Validated &amp; Saved
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Save Clearance Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
