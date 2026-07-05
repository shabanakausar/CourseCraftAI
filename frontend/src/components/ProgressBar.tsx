"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showText?: boolean;
}

export default function ProgressBar({ progress, className = "", showText = false }: ProgressBarProps) {
  const percentage = Math.min(Math.max(0, progress), 100);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showText && (
        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span>Progress</span>
          <span className="text-brand-cyan">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
