import datetime
import json
import os
import uuid

from google import genai
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types
from pydantic import BaseModel, Field

# Configurable model name
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# --- Pydantic Schemas for Tool Input / Output Validation ---


class ResourceModel(BaseModel):
    title: str = Field(description="The name/title of the study resource")
    type: str = Field(description="Must be 'book' or 'link'")
    url: str | None = Field(default=None, description="URL link if type is 'link'")


class ModuleModel(BaseModel):
    title: str = Field(description="The title of the learning stage")
    description: str = Field(description="A short summary of what this module covers")
    order: int = Field(description="1-indexed order of the module")
    estimatedDays: int = Field(description="Approximate days to complete this module")
    topics: list[str] = Field(description="3-4 core theoretical topics covered")
    projects: list[str] = Field(description="1-2 hands-on practice deliverables")
    resources: list[ResourceModel] = Field(description="Curated learning resources")


class RoadmapResponseModel(BaseModel):
    targetCareer: str = Field(
        description="The target career trajectory or specialized role"
    )
    estimatedTotalHours: int = Field(
        description="Estimated total hours of focused study"
    )
    aiRecommendation: str = Field(
        description="An encouraging first recommended action step"
    )
    modules: list[ModuleModel] = Field(description="Sequential learning modules")


class SkillBreakdownModel(BaseModel):
    skill: str
    pct: int


class AmbientNudgeModel(BaseModel):
    message: str
    reason: str
    generatedAt: str


class UserProgressModel(BaseModel):
    currentLevel: str
    overallProgressPct: int
    skillBreakdown: list[SkillBreakdownModel]
    nextRecommendation: str
    lastActivityAt: str
    ambientNudge: AmbientNudgeModel | None = None


class NudgeResponseModel(BaseModel):
    message: str = Field(
        description="A short, proactive recommendation under 3 sentences."
    )
    reason: str = Field(
        description="Must be one of 'stalled', 'blocker', 'celebration', 'on_track'"
    )


# --- Helper to initialize the GenAI Client ---
def get_genai_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return genai.Client(api_key=api_key)
    return genai.Client()


# --- Tool Implementations ---


def generate_roadmap(goal: str, skill_level: str) -> str:
    """Generates a structured learning roadmap for a given career or skill goal.

    Args:
        goal: The target skill or career goal (e.g. 'Become an AI Engineer').
        skill_level: The user's current experience level (Beginner, Intermediate, Advanced).

    Returns:
        A JSON string conforming to the structured roadmap layout.
    """
    client = get_genai_client()

    prompt = f"""Create a structured learning roadmap for a user who wants to achieve this goal: "{goal}".
The user's current experience level is: "{skill_level}".
The roadmap should consist of 4 to 6 logical sequential modules.
The first module should be structured for a quick initial win.
Provide high-quality study resources (mix of books and links).
Return the data structured to match the roadmap schema."""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RoadmapResponseModel,
        ),
    )

    if not response.text:
        raise ValueError("Failed to generate content from Gemini API.")

    data = json.loads(response.text)

    # Map to the frontend compatible schema
    modules_list = []
    for i, mod in enumerate(data.get("modules", [])):
        modules_list.append(
            {
                "id": f"module-{i + 1}-{uuid.uuid4().hex[:6]}",
                "title": mod.get("title"),
                "description": mod.get("description"),
                "order": mod.get("order", i + 1),
                "status": "in_progress" if i == 0 else "locked",
                "estimatedDays": mod.get("estimatedDays", 10),
                "topics": mod.get("topics", []),
                "projects": mod.get("projects", []),
                "resources": mod.get("resources", []),
            }
        )

    roadmap = {
        "id": f"roadmap-{uuid.uuid4().hex[:6]}",
        "goal": goal,
        "createdAt": datetime.datetime.now(datetime.UTC).isoformat(),
        "skillLevel": skill_level,
        "targetCareer": data.get("targetCareer", goal),
        "estimatedTotalHours": data.get("estimatedTotalHours", 100),
        "aiRecommendation": data.get("aiRecommendation", ""),
        "modules": modules_list,
    }

    return json.dumps(roadmap)


def generate_nudge(progress_json: str, goal: str, modules_json: str) -> str:
    """Generates an ambient agent recommendation (nudge) based on the user's progress.

    Args:
        progress_json: A JSON string containing the UserProgressModel data.
        goal: The user's main career/learning goal.
        modules_json: A JSON string representing the list of learning modules and their completion statuses.

    Returns:
        A JSON string containing the nudge recommendation and the reason code.
    """
    client = get_genai_client()

    prompt = f"""You are the CourseCraft AI learning architect agent.
The user is working towards the goal: "{goal}".

User progress state:
{progress_json}

Roadmap stages:
{modules_json}

Analyze the user's activity and progress. Generate a short, proactive micro-recommendation (nudge, under 3 sentences).
Determine the category of this nudge:
- 'stalled': User has not updated any stage for several days or has no stage 'in_progress'.
- 'blocker': User has been working on a stage for a duration exceeding the estimatedDays.
- 'celebration': User just completed a stage, offer congrats and suggest the next stage.
- 'on_track': General encouragement for consistent progress.

Return a JSON object matching the nudge schema."""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=NudgeResponseModel,
        ),
    )

    if not response.text:
        raise ValueError("Failed to generate nudge from Gemini API.")

    return response.text


root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model=MODEL_NAME,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction="You are CourseCraft AI learning architect agent.",
    tools=[generate_roadmap, generate_nudge],
)

app = App(
    root_agent=root_agent,
    name="coursecraft-agent",
)
