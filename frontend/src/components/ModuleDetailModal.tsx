"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  BookOpen,
  ExternalLink,
  CheckSquare,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy
} from "lucide-react";
import { Module } from "@/types";

interface ModuleDetailModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (moduleId: string, status: "in_progress" | "completed" | "locked") => Promise<void>;
}

export default function ModuleDetailModal({
  module,
  isOpen,
  onClose,
  onStatusChange,
}: ModuleDetailModalProps) {
  if (!module) return null;

  const isCompleted = module.status === "completed";
  const isInProgress = module.status === "in_progress";
  const isLocked = module.status === "locked";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-2xl bg-card-dark border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-wider font-semibold">
                  Stage {module.order} Curriculum Detail
                </span>
                <h2 className="text-xl font-bold font-sans tracking-tight text-white pr-6">
                  {module.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 border border-transparent hover:border-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Overview</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {module.description}
                </p>
              </div>

              {/* Stats row inside modal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-brand-purple" />
                  <div>
                    <p className="text-[9px] font-mono text-slate-500 uppercase">Duration</p>
                    <p className="text-xs font-bold text-white">{module.estimatedDays} Days Study</p>
                  </div>
                </div>
                <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center space-x-3">
                  <Trophy className="w-4 h-4 text-brand-cyan" />
                  <div>
                    <p className="text-[9px] font-mono text-slate-500 uppercase">Status</p>
                    <p className="text-xs font-bold text-white capitalize">{module.status.replace("_", " ")}</p>
                  </div>
                </div>
              </div>

              {/* Core Concepts */}
              {module.keyConcepts && module.keyConcepts.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Key Core Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {module.keyConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl text-slate-300"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Gained */}
              {module.skillsGained && module.skillsGained.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Acquired Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {module.skillsGained.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-brand-purple/10 border border-brand-purple/20 text-brand-purple px-3 py-1.5 rounded-xl font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Project Deliverable */}
              {module.deliverable && (
                <div className="p-4 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-brand-purple flex items-center space-x-1.5 uppercase font-mono tracking-wider">
                    <CheckSquare className="w-4 h-4" />
                    <span>Hands-on Project Checklist</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {module.deliverable}
                  </p>
                </div>
              )}

              {/* Resources list */}
              {module.resources && module.resources.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Study & Reference Materials</h3>
                  <div className="grid gap-2">
                    {module.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-brand-cyan/20 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <BookOpen className="w-4 h-4 text-brand-cyan shrink-0" />
                          <span className="truncate font-semibold">{res.title}</span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-white/5 rounded text-slate-400">
                            {res.type}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20 shrink-0 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer text-slate-300"
              >
                Close View
              </button>

              {isInProgress ? (
                <button
                  onClick={async () => {
                    await onStatusChange(module.id, "completed");
                    onClose();
                  }}
                  className="bg-gradient-to-r from-brand-emerald to-emerald-600 hover:from-brand-emerald hover:to-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all flex items-center space-x-2 text-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Stage Completed</span>
                </button>
              ) : isCompleted ? (
                <button
                  onClick={async () => {
                    await onStatusChange(module.id, "in_progress");
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Reopen Stage
                </button>
              ) : (
                <div className="bg-slate-900 border border-white/5 text-slate-500 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center space-x-2 select-none">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Complete preceding stages to unlock</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
