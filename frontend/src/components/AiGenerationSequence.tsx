"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { AgentStep } from "@/context/RoadmapContext";

interface AiGenerationSequenceProps {
  steps: AgentStep[];
}

export default function AiGenerationSequence({ steps }: AiGenerationSequenceProps) {
  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-8 rounded-2xl glow-card shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight">AI Co-pilot Orchestrator</h2>
          <p className="text-xs text-muted-foreground mt-1">Generating personalized curriculum flow...</p>
        </div>
        <div className="flex items-center space-x-1.5 bg-black/40 border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest text-brand-cyan uppercase">
          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
          Active
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const isIdle = step.status === "idle";
            const isLoading = step.status === "loading";
            const isSuccess = step.status === "success";
            const isError = step.status === "error";

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{
                  opacity: isIdle ? 0.4 : 1,
                  y: 0,
                  scale: isLoading ? 1.02 : 1
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex items-start space-x-4 p-3 rounded-lg border transition-colors ${
                  isLoading
                    ? "bg-brand-purple/5 border-brand-purple/30"
                    : isSuccess
                    ? "bg-brand-emerald/5 border-white/5"
                    : "border-transparent"
                }`}
              >
                <div className="mt-0.5">
                  {isIdle && (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                  {isLoading && (
                    <Loader2 className="w-5 h-5 text-brand-purple animate-spin" />
                  )}
                  {isSuccess && (
                    <motion.div
                      initial={{ scale: 0.5, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
                    </motion.div>
                  )}
                  {isError && (
                    <AlertCircle className="w-5 h-5 text-brand-pink" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium font-sans ${
                      isLoading
                        ? "text-brand-purple"
                        : isSuccess
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}>
                      {step.label}
                    </p>
                    {isSuccess && (
                      <span className="text-[10px] font-mono text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded uppercase">
                        Done
                      </span>
                    )}
                    {isLoading && (
                      <span className="text-[10px] font-mono text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded animate-pulse uppercase">
                        Running
                      </span>
                    )}
                  </div>

                  {isLoading && (
                    <motion.div
                      className="h-1 bg-brand-purple/20 rounded-full mt-3 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-[11px] font-mono text-slate-500">
          Powered by Gemini 2.5 Flash • Context Length: ~1M Tokens
        </p>
      </div>
    </div>
  );
}
