import { NextResponse } from "next/server";
import { detectPromptInjection, scrubPersonalData } from "@/utils/security";

export async function POST(request: Request) {
  try {
    const { roadmap } = await request.json();

    if (!roadmap || !roadmap.modules) {
      return NextResponse.json({ error: "Roadmap is required" }, { status: 400 });
    }

    // 1. Defend against prompt injection - block request completely
    if (
      (roadmap.goal && detectPromptInjection(roadmap.goal)) ||
      roadmap.modules.some((m: any) => m.description && detectPromptInjection(m.description))
    ) {
      return NextResponse.json(
        { error: "Security Violation: Potential prompt injection attempt detected. Request blocked." },
        { status: 400 }
      );
    }

    // 2. Scrub personal data from goal/modules
    const { scrubbedText: scrubbedGoal } = scrubPersonalData(roadmap.goal || "");
    const scrubbedModules = roadmap.modules.map((m: any) => {
      const { scrubbedText: scrubbedDesc } = scrubPersonalData(m.description || "");
      return {
        ...m,
        description: scrubbedDesc
      };
    });

    const completedCount = scrubbedModules.filter((m: any) => m.status === "completed").length;
    const totalCount = scrubbedModules.length;
    const overallProgressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Build the UserProgress model to satisfy ADK Pydantic schema validation
    const progress = {
      currentLevel: roadmap.skillLevel || "Beginner",
      overallProgressPct: overallProgressPct,
      skillBreakdown: scrubbedModules.map((m: any) => ({
        skill: m.title.substring(0, 30), // ensure clean string
        pct: m.status === "completed" ? 100 : (m.status === "in_progress" ? 50 : 0)
      })),
      nextRecommendation: roadmap.aiRecommendation || "Continue your path",
      lastActivityAt: new Date().toISOString(),
      ambientNudge: null
    };

    // Forward to Python agent backend nudge endpoint
    const agentUrl = process.env.AGENT_ENDPOINT_URL || "http://localhost:8000";
    const agentRes = await fetch(`${agentUrl}/api/generate-nudge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress,
        goal: scrubbedGoal,
        modules: scrubbedModules
      }),
    });

    if (!agentRes.ok) {
      const errMessage = await agentRes.text();
      throw new Error(`Agent backend error: ${errMessage}`);
    }

    const data = await agentRes.json();

    // Map nudge data to match frontend requirements (both legacy recommendation and rich nudge object)
    return NextResponse.json({
      recommendation: data.message,
      nudge: {
        message: data.message,
        reason: data.reason,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Gemini Recommendation Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recommendation" }, { status: 500 });
  }
}
