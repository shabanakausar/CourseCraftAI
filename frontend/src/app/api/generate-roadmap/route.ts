import { NextResponse } from "next/server";
import { detectPromptInjection, scrubPersonalData } from "@/utils/security";

export async function POST(request: Request) {
  try {
    const { goal, skillLevel } = await request.json();

    if (!goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    // 1. Defend against prompt injection - block request completely
    if (detectPromptInjection(goal)) {
      return NextResponse.json(
        { error: "Security Violation: Potential prompt injection attempt detected. Request blocked." },
        { status: 400 }
      );
    }

    // 2. Scrub personal data (SSN, credit card)
    const { scrubbedText: scrubbedGoal, redactedCategories } = scrubPersonalData(goal);

    // Call Python agent backend
    const agentUrl = process.env.AGENT_ENDPOINT_URL || "http://localhost:8000";
    const agentRes = await fetch(`${agentUrl}/api/generate-roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: scrubbedGoal, skillLevel }),
    });

    if (!agentRes.ok) {
      const errMessage = await agentRes.text();
      throw new Error(`Agent backend error: ${errMessage}`);
    }

    const data = await agentRes.json();

    // Add redacted categories if any
    if (redactedCategories.length > 0) {
      data.redactedCategories = redactedCategories;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini Roadmap Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate roadmap" }, { status: 500 });
  }
}
