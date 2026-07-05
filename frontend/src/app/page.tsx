"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoadmap } from "@/context/RoadmapContext";
import AiGenerationSequence from "@/components/AiGenerationSequence";
import { motion } from "framer-motion";
import { Sparkles, Brain, Award, Clock, ArrowRight, BookOpen } from "lucide-react";

const SUGGESTIONS = [
  { goal: "Become an AI Engineer", level: "Intermediate" },
  { goal: "Master React & Next.js App Router", level: "Beginner" },
  { goal: "Learn Rust for WebAssembly development", level: "Intermediate" },
  { goal: "Deep Dive into Data Structures & Algorithms", level: "Beginner" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { roadmap, isLoading, error, agentSteps, generateRoadmap } = useRoadmap();

  const [goal, setGoal] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-redirect if roadmap already exists
  useEffect(() => {
    if (roadmap && !isLoading && !isSubmitted) {
      router.push("/dashboard");
    }
  }, [roadmap, isLoading, isSubmitted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsSubmitted(true);
    try {
      await generateRoadmap(goal, skillLevel);
      router.push("/dashboard");
    } catch (err) {
      // Keep on onboarding page to display the error
      setIsSubmitted(false);
    }
  };

  const handleSuggestionClick = (suggestedGoal: string, suggestedLevel: string) => {
    setGoal(suggestedGoal);
    setSkillLevel(suggestedLevel);
  };

  const handleLoadDemo = () => {
    const mockRoadmap = {
      id: "roadmap-mock",
      goal: goal || "Become an AI Engineer",
      createdAt: new Date().toISOString(),
      skillLevel: skillLevel,
      targetCareer: "AI Engineer & Research Scientist",
      estimatedTotalHours: 120,
      aiRecommendation: "Start by completing the Foundations of Machine Learning to understand gradient descent.",
      modules: [
        {
          id: "module-1",
          title: "Foundations of Machine Learning",
          description: "Learn basic math, linear regression, gradient descent, and training loops using Python.",
          order: 1,
          status: "in_progress" as const,
          estimatedDays: 10,
          skillsGained: ["Python", "Numpy", "Scikit-Learn"],
          keyConcepts: ["Loss Functions", "Gradient Descent", "Supervised Learning"],
          deliverable: "Implement linear regression from scratch in python using only numpy.",
          resources: [
            { title: "StatQuest: Fitting a line with Gradient Descent", url: "https://youtube.com", type: "video" as const },
            { title: "Scikit-Learn Getting Started Guide", url: "https://scikit-learn.org", type: "documentation" as const }
          ]
        },
        {
          id: "module-2",
          title: "Deep Learning & Neural Networks",
          description: "Deep dive into multi-layer perceptrons, backpropagation, and CNNs using PyTorch.",
          order: 2,
          status: "locked" as const,
          estimatedDays: 14,
          skillsGained: ["PyTorch", "Neural Networks", "Tensor Operations"],
          keyConcepts: ["Backpropagation", "Activations", "Convolutions"],
          deliverable: "Build and train a convolutional neural network to classify handwritten digits on MNIST.",
          resources: [
            { title: "PyTorch Basics Tutorial", url: "https://pytorch.org", type: "documentation" as const },
            { title: "3Blue1Brown: What is a Neural Network?", url: "https://youtube.com", type: "video" as const }
          ]
        },
        {
          id: "module-3",
          title: "Natural Language Processing & LLMs",
          description: "Understand transformers, attention mechanisms, self-attention, and tokenization.",
          order: 3,
          status: "locked" as const,
          estimatedDays: 18,
          skillsGained: ["Hugging Face", "Transformers", "LLMs"],
          keyConcepts: ["Self-Attention", "Tokenization", "Embeddings"],
          deliverable: "Fine-tune a small GPT model on a custom dataset using Hugging Face transformers.",
          resources: [
            { title: "Illustrated Transformer by Jay Alammar", url: "https://jalammar.github.io", type: "article" as const }
          ]
        }
      ]
    };
    localStorage.setItem("coursecraft_roadmap", JSON.stringify(mockRoadmap));
    router.push("/dashboard");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (isLoading || (isSubmitted && !error)) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-4 bg-slate-950 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <AiGenerationSequence steps={agentSteps} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full py-6 px-6 lg:px-12 flex justify-between items-center z-10 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-purple/10 border border-brand-purple/30 rounded-xl">
            <Brain className="w-6 h-6 text-brand-purple" />
          </div>
          <span className="font-sans font-bold tracking-tight text-xl text-white">
            CourseCraft <span className="text-brand-purple">AI</span>
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          v1.0.0
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 z-10">
        <div className="w-full max-w-2xl text-center space-y-10">

          {/* Headline */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-brand-purple/10 border border-brand-purple/30 px-3 py-1 rounded-full text-xs font-medium text-brand-purple"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Personalized AI Learning</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans tracking-tight leading-[1.1] text-white"
            >
              Forge Your Custom Path <br />
              to <span className="gradient-text">Mastery</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 max-w-md mx-auto text-base sm:text-lg"
            >
              Enter any skill or career goal. Gemini AI builds a structured curriculum, curated resources, and project deliverables just for you.
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl text-left border border-white/10 relative"
          >
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Skill Input */}
              <div className="space-y-2">
                <label htmlFor="goal" className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-brand-cyan" />
                  <span>What do you want to learn?</span>
                </label>
                <div className="relative">
                  <input
                    id="goal"
                    type="text"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Become an AI Engineer, Learn Next.js, Master Python for Finance..."
                    className="w-full bg-black/40 border border-white/10 focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 rounded-2xl py-4 pl-4 pr-12 text-white placeholder-slate-500 outline-none transition-all text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-brand-purple/20 rounded-lg text-brand-purple">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Skill Level Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-brand-cyan" />
                  <span>Your current experience level</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => {
                    const isSelected = skillLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSkillLevel(level)}
                        className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                          isSelected
                            ? "bg-brand-purple/20 border-brand-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                            : "bg-black/30 border-white/5 text-slate-400 hover:border-white/15 hover:bg-black/50"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              {error && (
                <div className="space-y-3">
                  <div className="p-3 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-xs rounded-xl">
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadDemo}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-brand-purple" />
                    <span>Launch Demo Path (Simulate Generation)</span>
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={!goal.trim()}
                className="w-full bg-gradient-to-r from-brand-purple to-brand-cyan hover:from-brand-purple hover:to-brand-cyan/90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                <span>Generate Learning Roadmap</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Prompt Suggestions */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <span className="text-xs font-semibold text-slate-400">Or try one of these suggestions:</span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(item.goal, item.level)}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 py-1.5 px-3 rounded-full transition-all"
                  >
                    {item.goal} ({item.level})
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-white/5 text-xs text-slate-500 font-mono">
        Built with Google Gemini & Next.js for Kaggle Capstone
      </footer>
    </div>
  );
}
