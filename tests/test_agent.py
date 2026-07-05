import sys
import os
from unittest.mock import MagicMock

# Mock telemetry module to prevent opentelemetry dependency issues
mock_telemetry = MagicMock()
sys.modules['app.app_utils.telemetry'] = mock_telemetry

import pytest
from pydantic import ValidationError

# Add agent path to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../agent-backend/coursecraft-agent")))

from app.fast_api_app import RoadmapRequest, NudgeRequest

def test_roadmap_request_validation():
    """Verify that RoadmapRequest strictly validates non-empty inputs."""
    # Valid request
    req = RoadmapRequest(goal="Become an AI Engineer", skillLevel="Beginner")
    assert req.goal == "Become an AI Engineer"
    assert req.skillLevel == "Beginner"

    # Invalid request (empty goal)
    with pytest.raises(ValidationError):
        RoadmapRequest(goal="", skillLevel="Beginner")

    # Invalid request (missing field)
    with pytest.raises(ValidationError):
        RoadmapRequest(skillLevel="Beginner")

def test_no_shell_execution():
    """Assertion test: Verify no system commands or subprocesses are used to parse/execute tool logic."""
    # We verify this programmatically by confirming no use of subprocess in app/agent.py
    agent_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../agent-backend/coursecraft-agent/app/agent.py"))
    with open(agent_path, "r") as f:
        content = f.read()
        assert "subprocess" not in content
        assert "os.system" not in content
        assert "popen" not in content

def test_nudge_request_validation():
    """Verify that NudgeRequest validates UserProgress schemas and arrays properly."""
    # Valid Nudge request structure
    valid_payload = {
        "progress": {
            "currentLevel": "Beginner",
            "overallProgressPct": 0,
            "skillBreakdown": [{"skill": "Python", "pct": 0}],
            "nextRecommendation": "Start stage 1",
            "lastActivityAt": "2026-07-03T00:00:00Z"
        },
        "goal": "Learn Python",
        "modules": [
            {
                "id": "module-1",
                "title": "Python Basics",
                "description": "Intro to python",
                "order": 1,
                "status": "in_progress",
                "estimatedDays": 10,
                "topics": ["Variables"],
                "projects": ["Hello World"],
                "resources": [{"title": "Docs", "type": "link", "url": "https://python.org"}]
            }
        ]
    }

    req = NudgeRequest(**valid_payload)
    assert req.goal == "Learn Python"
    assert req.progress.currentLevel == "Beginner"
    assert req.modules[0].status == "in_progress"

    # Malformed Nudge request (missing progress fields)
    invalid_payload = {
        "progress": {
            "currentLevel": "Beginner",
            "overallProgressPct": 0
        },
        "goal": "Learn Python",
        "modules": []
    }
    with pytest.raises(ValidationError):
        NudgeRequest(**invalid_payload)
