# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import contextlib
import json
import os
from collections.abc import AsyncIterator

import google.auth
from a2a.server.tasks import InMemoryTaskStore
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.runners import Runner
from google.cloud import logging as google_cloud_logging
from pydantic import BaseModel, Field

from app.agent import generate_nudge, generate_roadmap
from app.app_utils import services
from app.app_utils.a2a import attach_a2a_routes
from app.app_utils.telemetry import setup_telemetry
from app.app_utils.typing import Feedback

load_dotenv()

# Handle local execution gracefully if Google Cloud ADC is not configured
try:
    setup_telemetry()
    _, project_id = google.auth.default()
    if project_id:
        os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
except Exception as e:
    print(f"Warning: Telemetry/ADC setup failed: {e}. Running in local mode.")
    project_id = "local-project"
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)

logger = None
try:
    logging_client = google_cloud_logging.Client()
    logger = logging_client.logger(__name__)
except Exception:
    import logging

    logging.basicConfig(level=logging.INFO)
    std_logger = logging.getLogger(__name__)

    class MockLogger:
        def log_struct(self, data, severity="INFO"):
            std_logger.info(f"[{severity}] {data}")

    logger = MockLogger()

allow_origins = (
    os.getenv("ALLOW_ORIGINS", "").split(",") if os.getenv("ALLOW_ORIGINS") else None
)

AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- Pydantic Schemas for API Requests ---


class RoadmapRequest(BaseModel):
    goal: str = Field(..., min_length=1)
    skillLevel: str = Field(..., min_length=1)


class SkillBreakdownItem(BaseModel):
    skill: str
    pct: int


class NudgeInfo(BaseModel):
    message: str
    reason: str
    generatedAt: str


class ProgressInfo(BaseModel):
    currentLevel: str
    overallProgressPct: int
    skillBreakdown: list[SkillBreakdownItem]
    nextRecommendation: str
    lastActivityAt: str
    ambientNudge: NudgeInfo | None = None


class ResourceInfo(BaseModel):
    title: str
    type: str
    url: str | None = None


class ModuleInfo(BaseModel):
    id: str
    title: str
    description: str
    order: int
    status: str
    estimatedDays: int
    topics: list[str]
    projects: list[str]
    resources: list[ResourceInfo]


class NudgeRequest(BaseModel):
    progress: ProgressInfo
    goal: str
    modules: list[ModuleInfo]


# --- FastAPI Lifespan ---


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    from app.agent import root_agent

    class MockAdkApp:
        name = "coursecraft-agent"

        def __getattr__(self, name):
            return None

    adk_app = MockAdkApp()
    adk_app.root_agent = root_agent

    runner = Runner(
        app=adk_app,
        session_service=services.get_session_service(),
        artifact_service=services.get_artifact_service(),
        auto_create_session=True,
    )
    app.state.runner = runner
    app.state.agent_app_name = adk_app.name
    await attach_a2a_routes(
        app,
        agent=root_agent,
        runner=runner,
        task_store=InMemoryTaskStore(),
        rpc_path=f"/a2a/{adk_app.name}",
    )
    yield


app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    artifact_service_uri=services.ARTIFACT_SERVICE_URI,
    allow_origins=allow_origins,
    session_service_uri=services.SESSION_SERVICE_URI,
    otel_to_cloud=False,
    lifespan=lifespan,
)
app.title = "coursecraft-agent"
app.description = "API for interacting with the Agent coursecraft-agent"

# --- API Route Implementations ---


@app.post("/api/generate-roadmap")
async def api_generate_roadmap(payload: RoadmapRequest) -> dict:
    """FastAPI endpoint to validate inputs and generate a learning roadmap."""
    try:
        roadmap_json = generate_roadmap(payload.goal, payload.skillLevel)
        return json.loads(roadmap_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/generate-nudge")
async def api_generate_nudge(payload: NudgeRequest) -> dict:
    """FastAPI endpoint to validate inputs and generate ambient notifications/nudges."""
    try:
        progress_str = payload.progress.model_dump_json()
        modules_str = json.dumps([m.model_dump() for m in payload.modules])
        nudge_json = generate_nudge(progress_str, payload.goal, modules_str)
        return json.loads(nudge_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/feedback")
def collect_feedback(feedback: Feedback) -> dict[str, str]:
    """Collect and log feedback.

    Args:
        feedback: The feedback data to log

    Returns:
        Success message
    """
    logger.log_struct(feedback.model_dump(), severity="INFO")
    return {"status": "success"}


# Main execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
