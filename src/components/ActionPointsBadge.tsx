"use client";

import React from "react";
import { Zap, AlertTriangle } from "lucide-react";

interface ActionPointsBadgeProps {
  points: number;
  maxPoints?: number;
}

export function ActionPointsBadge({ points, maxPoints = 12 }: ActionPointsBadgeProps) {
  const percentage = Math.max(0, Math.min(100, (points / maxPoints) * 100));

  let colorClasses = "text-amber-400 border-amber-500/40 bg-amber-950/30";
  let barColor = "bg-amber-500";
  let statusText = "OPERATIONAL";

  if (points >= 8) {
    colorClasses = "text-emerald-400 border-emerald-500/40 bg-emerald-950/30";
    barColor = "bg-emerald-500";
    statusText = "HIGH INITIATIVE";
  } else if (points <= 3) {
    colorClasses = "text-rose-400 border-rose-500/50 bg-rose-950/40 animate-pulse";
    barColor = "bg-rose-500";
    statusText = "CRITICAL LEAD DEPLETION";
  }

  return (
    <div
      data-tour="action-points"
      className={`flex items-center gap-3 px-3.5 py-1.5 rounded border ${colorClasses} backdrop-blur-md shadow-sm transition-all`}
      title="Action Points (AP): 1 AP per chat inquiry, 2 AP per forensic scan. Manage your investigation budget carefully!"
    >
      <div className="flex items-center gap-1.5">
        <Zap className="w-4 h-4" />
        <span className="font-typewriter text-xs font-bold tracking-wider">
          AP: <span className="text-sm font-black">{points}</span> / {maxPoints}
        </span>
      </div>

      <div className="w-20 h-2 bg-noir-850 rounded-full overflow-hidden border border-white/10 hidden sm:block">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {points <= 3 && (
        <span className="text-[10px] font-typewriter font-bold text-rose-300 flex items-center gap-1 hidden md:flex">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          LOW BUDGET
        </span>
      )}
    </div>
  );
}
