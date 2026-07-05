"use client";

import React from "react";
import { CheckCircle2, PlayCircle, Lock, Clock } from "lucide-react";
import { Module } from "@/types";

interface RoadmapTimelineProps {
  modules: Module[];
  activeModuleId: string | null;
  onSelectModule: (id: string) => void;
}

export default function RoadmapTimeline({
  modules,
  activeModuleId,
  onSelectModule,
}: RoadmapTimelineProps) {
  return (
    <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
      {modules.map((mod) => {
        const isActive = mod.id === activeModuleId;
        const isCompleted = mod.status === "completed";
        const isInProgress = mod.status === "in_progress";
        const isLocked = mod.status === "locked";

        return (
          <button
            key={mod.id}
            onClick={() => {
              if (!isLocked || isActive) {
                onSelectModule(mod.id);
              }
            }}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-4 relative group cursor-pointer ${
              isActive
                ? "glass-panel bg-brand-purple/10 border-brand-purple shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                : isCompleted
                ? "bg-slate-900/40 border-brand-emerald/20 hover:border-brand-emerald/40 hover:bg-slate-900/60"
                : isLocked
                ? "bg-slate-950/20 border-white/5 opacity-50 cursor-not-allowed hover:opacity-60"
                : "bg-slate-900/20 border-white/5 hover:border-white/10 hover:bg-slate-900/40"
            }`}
            disabled={isLocked && !isActive}
          >
            {/* Status Indicator Icon */}
            <div className="mt-0.5 shrink-0">
              {isCompleted && (
                <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
              )}
              {isInProgress && (
                <PlayCircle className="w-5 h-5 text-brand-cyan animate-pulse" />
              )}
              {isLocked && <Lock className="w-5 h-5 text-slate-600" />}
            </div>

            {/* Content info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Stage {mod.order}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{mod.estimatedDays}d</span>
                </span>
              </div>
              <h3
                className={`text-sm font-semibold truncate ${
                  isActive ? "text-white" : "text-slate-300"
                }`}
              >
                {mod.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {mod.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
