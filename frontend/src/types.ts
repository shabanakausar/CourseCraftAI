export type ModuleStatus = "locked" | "in_progress" | "completed";

export interface Resource {
  title: string;
  url: string;
  type: "video" | "article" | "documentation" | "interactive";
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number; // 1-indexed module order
  status: ModuleStatus;
  estimatedDays: number;
  skillsGained?: string[];
  keyConcepts?: string[];
  deliverable?: string; // Actionable exercise/project to complete the module
  resources?: Resource[];
}

export interface Roadmap {
  id: string;
  goal: string;
  createdAt: string;
  modules: Module[];
  skillLevel?: string;
  targetCareer?: string;
  estimatedTotalHours?: number;
  aiRecommendation?: string;
  redactedCategories?: string[];
}
