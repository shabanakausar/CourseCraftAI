# STRIDE Threat Modeling - CourseCraft AI

This document provides a systematic threat modeling assessment for CourseCraft AI under the STRIDE framework.

---

## 1. System Boundaries and Entry Points
- **Entry Points**:
  - User goal input (Onboarding page).
  - Roadmap generation API endpoint (`/api/generate-roadmap`).
  - Ambient nudge generation API endpoint (`/api/generate-nudge`).
  - Active module state update controls.
- **Data Layers**:
  - Client-side browser `localStorage` (roadmaps, completion state, user progress).
  - Environment variables (API keys).

---

## 2. STRIDE Assessment

### Spoofing (Identity Spoofing)
- **Threat**: Attackers make direct unauthorized HTTP requests to the FastAPI backend, bypassing the Next.js frontend proxy/validation checks.
- **Mitigation**: Secure backend endpoints with local-only binding (`127.0.0.1`) or enforce API secret tokens between the frontend proxy and the Python backend service.

### Tampering (Data Manipulation)
- **Threat**: Users manipulate the state stored in browser `localStorage` to unlock locked stages, complete modules without doing the deliverables, or tamper with the roadmap structure.
- **Mitigation**: Validate the structure and order of module progress on the backend before generating suggestions. Reject invalid transitions (e.g. completing a locked stage).

### Repudiation
- **Threat**: Lack of transaction history or security logs makes it impossible to trace who submitted malicious prompts or triggered excessive API resource usage.
- **Mitigation**: Maintain structured logs of generation requests on the server, detailing timestamps and status codes, while strictly omitting raw user PII.

### Information Disclosure (Privacy/PII Leakage)
- **Threat**: Users input Social Security Numbers (SSNs) or credit card details into their goal descriptions, which are then leaked in server logs, API responses, or transmitted to external AI models.
- **Mitigation**: Apply input scrubbing filters to replace SSNs (`[REDACTED_SSN]`) and Credit Cards (`[REDACTED_CC]`) before they reach any logging statement, the database, or LLM prompts.

### Denial of Service (System Exhaustion)
- **Threat**: Flood attacks on the `generate_roadmap` endpoint exhaust the Vertex AI / Gemini quota, leading to service outage.
- **Mitigation**: Enforce rate limits on the API endpoints and set timeouts on calls to the external Gemini API.

### Elevation of Privilege
- **Threat**: Exploiting malformed input to execute arbitrary code or bypass validation rules in python tool handlers.
- **Mitigation**: Enforce strict validation of all tool arguments against Pydantic schemas. Never pass raw user strings to shell execution functions.
