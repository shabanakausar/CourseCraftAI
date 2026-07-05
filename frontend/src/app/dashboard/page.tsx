"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRoadmap } from "@/context/RoadmapContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  RotateCcw,
  Sparkles,
  Clock,
  Trophy,
  Compass,
  ArrowRight,
  Send,
  MessageSquare,
  AlertTriangle,
  Zap
} from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import StatCard from "@/components/StatCard";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import ModuleDetailModal from "@/components/ModuleDetailModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function DashboardPage() {
  const router = useRouter();
  const {
    roadmap,
    activeModuleId,
    setActiveModuleId,
    updateModuleStatus,
    resetRoadmap,
    messages,
    sendMessage,
    isLoading
  } = useRoadmap();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isNudgeNew, setIsNudgeNew] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Redirect if no roadmap generated yet
  useEffect(() => {
    if (!roadmap) {
      router.push("/");
    }
  }, [roadmap, router]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Trigger glow effect when a new recommendation is loaded
  useEffect(() => {
    if (roadmap?.aiRecommendation) {
      setIsNudgeNew(true);
      const timer = setTimeout(() => setIsNudgeNew(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [roadmap?.aiRecommendation]);

  if (!roadmap) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-mono">Loading your AI command center...</p>
        </div>
      </div>
    );
  }

  // Progress metrics
  const totalModules = roadmap.modules.length;
  const completedModules = roadmap.modules.filter(m => m.status === "completed").length;
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const selectedModule = roadmap.modules.find(m => m.id === activeModuleId) || roadmap.modules[0];

  // Dynamic Skill Map calculation using ProgressBar
  const skillMap = new Map<string, number>();
  roadmap.modules.forEach(mod => {
    const score = mod.status === "completed" ? 100 : (mod.status === "in_progress" ? 50 : 0);
    mod.skillsGained?.forEach(skill => {
      skillMap.set(skill, Math.max(skillMap.get(skill) || 0, score));
    });
  });

  const skillsList = Array.from(skillMap.entries()).map(([name, pct]) => ({ name, pct }));

  const handleStatusChange = async (moduleId: string, status: "in_progress" | "completed" | "locked") => {
    await updateModuleStatus(moduleId, status);
  };

  const handleSelectModule = (id: string) => {
    setActiveModuleId(id);
    setIsModalOpen(true);
  };

  const handleConfirmReset = () => {
    resetRoadmap();
    router.push("/");
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    const text = chatInput;
    setChatInput("");
    await sendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0F] text-[#F5F5F7] min-h-screen relative overflow-x-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-brand-cyan/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-20 py-4 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-purple/10 border border-brand-purple/30 rounded-xl">
            <Brain className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <span className="font-sans font-bold tracking-tight text-lg text-white">
              CourseCraft <span className="text-brand-purple">AI</span>
            </span>
            <span className="hidden sm:inline-block text-xs text-[#9A9AA5] font-mono ml-3 border-l border-white/10 pl-3">
              Your AI Learning Architect
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsConfirmOpen(true)}
          className="flex items-center space-x-2 text-xs font-semibold text-[#9A9AA5] hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </header>

      {/* Main Split-Pane Workspace */}
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full z-10">

        {/* Left Panel: Chat Thread (35% on Desktop) */}
        <section className="lg:col-span-4 flex flex-col glass-panel rounded-3xl border border-white/10 p-5 min-h-[550px] lg:h-[calc(100vh-140px)] sticky top-[80px]">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5 mb-4 shrink-0">
            <MessageSquare className="w-4 h-4 text-brand-purple" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              Architect Chat
            </h2>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-slate-500 font-mono mb-1">
                  {msg.sender === "user" ? "You" : "Architect Agent"}
                </span>
                <div className={`p-3 rounded-2xl text-sm max-w-[90%] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-brand-purple/20 border border-brand-purple/30 text-white rounded-tr-none"
                    : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleChatSubmit} className="relative shrink-0">
            <input
              type="text"
              required
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask to adjust curriculum or skills..."
              disabled={isLoading}
              className="w-full bg-black/40 border border-white/10 focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 rounded-2xl py-3.5 pl-4 pr-12 text-white placeholder-slate-500 outline-none transition-all text-xs"
            />
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple rounded-xl transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* Right Panel: generated course workspace (65% on Desktop) */}
        <section className="lg:col-span-8 space-y-6">

          {/* Top Header Card */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-full uppercase tracking-wider font-mono">
                  {roadmap.skillLevel} Path
                </span>
                {roadmap.targetCareer && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full font-mono">
                    {roadmap.targetCareer}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-sans leading-tight">
                {roadmap.targetCareer || roadmap.goal}
              </h1>
              {roadmap.targetCareer && roadmap.goal && !roadmap.goal.includes("[REDACTED") && (
                <p className="text-xs text-slate-400 font-medium">
                  Goal: {roadmap.goal}
                </p>
              )}
            </div>

            {/* Progress Bar Card */}
            <div className="flex flex-col md:items-end space-y-2 min-w-[240px]">
              <ProgressBar progress={progressPercent} showText />
              <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1.5 mt-1">
                <Trophy className="w-3.5 h-3.5 text-brand-purple" />
                <span>{completedModules} of {totalModules} stages completed</span>
              </div>
            </div>
          </div>

          {/* Security Redaction Banner */}
          {roadmap.redactedCategories && roadmap.redactedCategories.length > 0 && (
            <div className="p-4 rounded-xl border border-brand-pink/25 bg-brand-pink/10 text-brand-pink text-xs font-semibold flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-brand-pink shrink-0" />
              <span>
                Security Note: We detected and redacted sensitive personal data ({roadmap.redactedCategories.join(", ")}) from your learning goal.
              </span>
            </div>
          )}

          {/* Ambient Agent Recommendation Card */}
          <div className={`glass-panel p-6 rounded-3xl border transition-all duration-700 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            isNudgeNew
              ? "border-brand-purple shadow-[0_0_30px_rgba(124,92,255,0.2)] scale-[1.01]"
              : "border-white/10"
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 blur-2xl pointer-events-none" />

            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-purple animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-brand-purple">
                  Agent Nudge
                </span>
                {isNudgeNew && (
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan rounded-full animate-bounce">
                    Agent noticed something
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic max-w-2xl">
                {roadmap.aiRecommendation ? (
                  `"${roadmap.aiRecommendation}"`
                ) : (
                  "Analyzing progress and tailoring your next recommended micro-step..."
                )}
              </p>
            </div>
            <div className="text-[10px] text-brand-purple font-mono uppercase tracking-wider shrink-0 flex items-center space-x-1.5 bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-pulse" />
              <span>Co-pilot Ready</span>
            </div>
          </div>

          {/* Stats & Stepper Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left: Interactive Timeline Stepper */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono px-1 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-brand-cyan" />
                <span>Curriculum Stages</span>
              </h2>
              <RoadmapTimeline
                modules={roadmap.modules}
                activeModuleId={activeModuleId}
                onSelectModule={handleSelectModule}
              />
            </div>

            {/* Right: Stats & Skill Map */}
            <div className="space-y-6">

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Total Duration"
                  value={`${roadmap.estimatedTotalHours || 120} Hours`}
                  description="Focused recommendation"
                  icon={Clock}
                  iconColor="text-brand-cyan"
                  bgColor="bg-brand-cyan/10"
                />
                <StatCard
                  title="Confidence"
                  value="98%"
                  description="Curriculum tailoring match"
                  icon={Zap}
                  iconColor="text-brand-purple"
                  bgColor="bg-brand-purple/10"
                />
              </div>

              {/* Skill Map Card */}
              {skillsList.length > 0 && (
                <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono pb-2 border-b border-white/5">
                    Acquired Skill Map
                  </h3>
                  <div className="space-y-3">
                    {skillsList.map((skill, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-400">
                          <span>{skill.name}</span>
                          <span className="text-brand-cyan">{skill.pct}%</span>
                        </div>
                        <ProgressBar progress={skill.pct} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </section>

      </main>

      {/* Module Detail Modal Overlay */}
      <ModuleDetailModal
        module={selectedModule}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />

      {/* Reset Confirmation Overlay */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Start New Goal"
        message="Are you sure you want to delete this roadmap and start over with a new goal? Your current progress will be lost."
        confirmText="Yes, Reset"
        cancelText="Cancel"
      />

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-slate-500 font-mono mt-12 z-10">
        CourseCraft AI • Python ADK Agent Backend & Google Gemini
      </footer>
    </div>
  );
}
