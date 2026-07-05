"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Roadmap, Module, ModuleStatus } from "@/types";

export interface AgentStep {
  id: string;
  label: string;
  status: "idle" | "loading" | "success" | "error";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

interface RoadmapContextType {
  roadmap: Roadmap | null;
  isLoading: boolean;
  error: string | null;
  activeModuleId: string | null;
  agentSteps: AgentStep[];
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  generateRoadmap: (goal: string, skillLevel: string) => Promise<void>;
  updateModuleStatus: (moduleId: string, status: ModuleStatus) => Promise<void>;
  setActiveModuleId: (id: string | null) => void;
  resetRoadmap: () => void;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

const INITIAL_STEPS: AgentStep[] = [
  { id: "analyze", label: "Understanding your goal...", status: "idle" },
  { id: "competencies", label: "Analyzing required skills...", status: "idle" },
  { id: "structure", label: "Designing curriculum...", status: "idle" },
  { id: "resources", label: "Selecting resources...", status: "idle" },
  { id: "challenges", label: "Creating assessments...", status: "idle" },
  { id: "finalize", label: "Course Ready!", status: "idle" },
];

export function RoadmapProvider({ children }: { children: React.ReactNode }) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("coursecraft_roadmap");
    if (saved) {
      try {
        const parsed: Roadmap = JSON.parse(saved);
        setRoadmap(parsed);
        const active = parsed.modules.find(m => m.status === "in_progress") || parsed.modules[0];
        if (active) {
          setActiveModuleId(active.id);
        }
      } catch (e) {
        console.error("Failed to parse saved roadmap", e);
      }
    }

    const savedMsgs = localStorage.getItem("coursecraft_chat_messages");
    if (savedMsgs) {
      try {
        setMessages(JSON.parse(savedMsgs));
      } catch (e) {
        console.error("Failed to parse chat messages", e);
      }
    }
  }, []);

  // Save to localStorage
  const saveRoadmap = (updatedRoadmap: Roadmap) => {
    setRoadmap(updatedRoadmap);
    localStorage.setItem("coursecraft_roadmap", JSON.stringify(updatedRoadmap));
  };

  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem("coursecraft_chat_messages", JSON.stringify(newMessages));
  };

  // Generate roadmap calling Next.js Proxy API
  const generateRoadmap = async (goal: string, skillLevel: string) => {
    setIsLoading(true);
    setError(null);
    setAgentSteps(INITIAL_STEPS.map((s, i) => (i === 0 ? { ...s, status: "loading" } : s)));

    let stepTimer: NodeJS.Timeout | null = null;
    let stepIndex = 0;

    // Simulate progress check-list steps while waiting for agent response
    const advanceSteps = () => {
      stepTimer = setTimeout(() => {
        setAgentSteps(prev => {
          const next = [...prev];
          if (stepIndex < next.length - 1) {
            next[stepIndex] = { ...next[stepIndex], status: "success" };
            stepIndex++;
            next[stepIndex] = { ...next[stepIndex], status: "loading" };
            advanceSteps();
          }
          return next;
        });
      }, 1000);
    };

    advanceSteps();

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, skillLevel }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate roadmap");
      }

      const data: Roadmap = await response.json();

      if (stepTimer) clearTimeout(stepTimer);

      setAgentSteps(prev => prev.map(s => ({ ...s, status: "success" })));
      await new Promise(resolve => setTimeout(resolve, 500));

      saveRoadmap(data);
      if (data.modules && data.modules.length > 0) {
        setActiveModuleId(data.modules[0].id);
      }

      // Add agent welcome message
      const systemWelcome: ChatMessage = {
        id: `welcome-${Date.now()}`,
        sender: "agent",
        text: `Based on your goal: "${data.goal}", I have created your tailored learning roadmap. You have ${data.modules.length} stages to complete.`,
        timestamp: new Date().toISOString()
      };
      saveMessages([systemWelcome]);

    } catch (err: any) {
      if (stepTimer) clearTimeout(stepTimer);
      setAgentSteps(prev =>
        prev.map(s => (s.status === "loading" ? { ...s, status: "error" } : s))
      );
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send message from chat box
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };

    const newMsgs = [...messages, userMsg];
    saveMessages(newMsgs);

    setIsLoading(true);
    try {
      // Use user chat input as the new goal/instruction to regenerate the roadmap
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: text,
          skillLevel: roadmap?.skillLevel || "Beginner"
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update roadmap");
      }

      const data: Roadmap = await response.json();
      saveRoadmap(data);
      if (data.modules && data.modules.length > 0) {
        setActiveModuleId(data.modules[0].id);
      }

      const agentReply: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: "agent",
        text: `I've updated your learning path based on: "${text}". The new roadmap is loaded. Let me know if you need any other modifications!`,
        timestamp: new Date().toISOString()
      };
      saveMessages([...newMsgs, agentReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: "agent",
        text: `Error updating roadmap: ${err.message}`,
        timestamp: new Date().toISOString()
      };
      saveMessages([...newMsgs, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update module status and call nudge API
  const updateModuleStatus = async (moduleId: string, status: ModuleStatus) => {
    if (!roadmap) return;

    let updatedModules = roadmap.modules.map(mod => {
      if (mod.id === moduleId) {
        return { ...mod, status };
      }
      return mod;
    });

    if (status === "completed") {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#7C5CFF", "#00E5C7", "#3DD68C", "#ec4899"],
      });

      const completedMod = updatedModules.find(m => m.id === moduleId);
      if (completedMod) {
        const nextOrder = completedMod.order + 1;
        updatedModules = updatedModules.map(mod => {
          if (mod.order === nextOrder && mod.status === "locked") {
            return { ...mod, status: "in_progress" };
          }
          return mod;
        });
      }
    }

    const updatedRoadmap = {
      ...roadmap,
      modules: updatedModules,
    };

    saveRoadmap(updatedRoadmap);

    // Call API route to generate a new agent nudge based on progress
    try {
      const response = await fetch("/api/generate-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmap: updatedRoadmap }),
      });
      if (response.ok) {
        const data = await response.json();

        saveRoadmap({
          ...updatedRoadmap,
          aiRecommendation: data.recommendation,
        });

        if (data.recommendation) {
          const agentNudgeMsg: ChatMessage = {
            id: `msg-nudge-${Date.now()}`,
            sender: "agent",
            text: `[Agent Notice] ${data.recommendation}`,
            timestamp: new Date().toISOString()
          };
          saveMessages([...messages, agentNudgeMsg]);
        }
      }
    } catch (err) {
      console.error("Failed to generate agent recommendation", err);
    }
  };

  const resetRoadmap = () => {
    setRoadmap(null);
    setActiveModuleId(null);
    setAgentSteps(INITIAL_STEPS);
    setMessages([]);
    localStorage.removeItem("coursecraft_roadmap");
    localStorage.removeItem("coursecraft_chat_messages");
  };

  return (
    <RoadmapContext.Provider
      value={{
        roadmap,
        isLoading,
        error,
        activeModuleId,
        agentSteps,
        messages,
        sendMessage,
        generateRoadmap,
        updateModuleStatus,
        setActiveModuleId,
        resetRoadmap,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmap() {
  const context = useContext(RoadmapContext);
  if (context === undefined) {
    throw new Error("useRoadmap must be used within a RoadmapProvider");
  }
  return context;
}
