"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface InfoButtonProps {
  text: string;
  className?: string;
}

export function InfoButton({ text, className = "" }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-5 h-5 rounded-full bg-noir-850 hover:bg-noir-800 text-noir-400 hover:text-amber-400 border border-noir-700 hover:border-amber-500/50 flex items-center justify-center transition shadow-sm cursor-pointer"
        aria-label="More information"
        title="More information"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 bg-noir-900 border border-amber-500/40 rounded-md shadow-2xl text-xs font-sans text-noir-200 leading-relaxed z-50 animate-in fade-in zoom-in-95 duration-100 pointer-events-auto">
          <p>{text}</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 w-2 h-2 bg-noir-900 border-r border-b border-amber-500/40 rotate-45" />
        </div>
      )}
    </div>
  );
}
