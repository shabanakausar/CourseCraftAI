"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-brand-purple",
  bgColor = "bg-brand-purple/10",
}: StatCardProps) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex-1">
      {/* Small design circle */}
      <div className={`absolute -top-6 -right-6 w-12 h-12 ${bgColor} rounded-full blur-xl pointer-events-none opacity-40`} />

      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${bgColor} border border-white/5 shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono truncate">
            {title}
          </p>
          <h3 className="text-xl font-bold font-sans text-white truncate leading-none mt-0.5">
            {value}
          </h3>
          {description && (
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
