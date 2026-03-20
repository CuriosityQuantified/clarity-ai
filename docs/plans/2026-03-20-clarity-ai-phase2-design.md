# Clarity AI Phase 2: Fact Gatherer Backend + Verification Pipeline

> **For agent:** REQUIRED SUB-SKILL: Use Superpowers Section 4 or Section 5 to implement this plan.

**Goal:** Replace Phase 1 mock data with a real AI-powered fact gathering, verification, and analysis pipeline. Fact Gatherers extract and verify quotes from the web; Analysis Agents reason over the curated fact store; the CopilotKit frontend displays verified evidence in real-time via AG-UI protocol.

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│  CopilotKit Frontend (Next.js)                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Document  │  │  Evidence    │  │  CopilotKit Chat  │  │
│  │ Viewer    │  │  Panel       │  │  (AG-UI stream)   │  │
│  └─────┬────┘  └──────┬───────┘  └────────┬──────────┘  │
│        │              │                    │             │
│        └──────────────┴────────────────────┘             │
│                        │ AG-UI Protocol                  │
├────────────────────────┼────────────────────────────────┤
│  Python Backend        │                                │
│  ┌─────────────────────▼──────────────────────────┐     │
│  │  CopilotKit Runtime (FastAPI + AG-UI)          │     │
│  │  └── LangGraph StateGraph                      │     │
│  │       ├── verify_claim_node                    │     │
│  │       │   └── Fact Gatherer Agent              │     │
│  │       │       ├── web_search (Tavily)          │     │
│  │       │       ├── web_fetch (URL verification) │     │
│  │       │       └── save_fact (schema-validated)  │     │
│  │       ├── analyze_node                         │     │
│  │       │   └── Analysis Agent (reads fact store) │     │
│  │       └── respond_node                         │     │
│  │           └── Format for frontend display      │     │
│  └────────────────────────────────────────────────┘     │
│                        │                                │
│  ┌─────────────────────▼──────────────────────────┐     │
│  │  Fact Store (JSON file → SQLite later)          │     │
│  │  facts.json                                     │     │
│  └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Tech Stack:** Python 3.11+, FastAPI, LangGraph, CopilotKit Python SDK (`copilotkit`), Tavily Search API, httpx (URL verification), Pydantic (schema validation)

---

## Fact Store Schema (Pydantic + JSON)

```python
class VerifiedFact(BaseModel):
    id: str                          # UUID
    claim: str                       # Exact verbatim quote from source
    source_name: str                 # Publication/author name
    source_url: str                  # Full verified URL
    source_url_with_highlight: str   # URL with #:~:text= fragment for direct verification
    publication_date: str | None     # When source was published
    retrieval_timestamp: str         # When fact was gathered (ISO 8601)
    context: str                     # Methodology, sample, conditions + surrounding paragraph
    in_context: list[str]           # What this fact applies to (REQUIRED, ≥1)
    out_of_context: list[str]       # What this fact does NOT apply to (REQUIRED, ≥1)
    verified: Literal["YES", "PARTIAL", "UNABLE_TO_VERIFY"]
    confidence: Literal["HIGH", "MODERATE", "LOW"]
    confidence_score: float         # 0.0-1.0 numeric for the gauge
    url_accessible: bool            # Did URL resolve at retrieval time?
    text_found_at_url: bool         # Was exact quote found at URL?

class FactStore(BaseModel):
    facts: list[VerifiedFact] = []
    last_updated: str               # ISO 8601
    version: str = "1.0"
```

Key design decisions:
- `source_url_with_highlight` uses Chrome's text fragment syntax: `https://example.com/article#:~:text=exact%20quote%20here`
- `url_accessible` and `text_found_at_url` are set by the fact gatherer during self-verification
- `applies_to` / `does_not_apply_to` are REQUIRED lists — the analysis agent uses these as context boundaries
- `confidence_score` maps to the frontend gauge (0.94 → "94%" → "High Confidence")

---

## Task 1: Python Backend Scaffold

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py` (FastAPI app)
- Create: `backend/app/models.py` (Pydantic schemas)
- Create: `backend/app/fact_store.py` (JSON file read/write)
- Create: `backend/tests/test_models.py`
- Create: `backend/tests/test_fact_store.py`

**Step 1:** Write test: VerifiedFact validates required fields, rejects missing applies_to
**Step 2:** Run test, verify fails
**Step 3:** Implement Pydantic models (VerifiedFact, FactStore)
**Step 4:** Write test: FactStore saves/loads facts to JSON file, deduplicates by URL+claim
**Step 5:** Run test, verify fails
**Step 6:** Implement fact_store.py — load, save, add_fact, get_facts_by_query, get_fact_by_id
**Step 7:** Set up FastAPI app skeleton with health check endpoint
**Step 8:** Run tests, verify pass
**Step 9:** Commit: `feat: python backend scaffold with fact store schema and persistence`

---

## Task 2: Fact Gatherer Agent (LangGraph)

**Files:**
- Create: `backend/app/agents/__init__.py`
- Create: `backend/app/agents/fact_gatherer.py`
- Create: `backend/app/tools/search.py` (Tavily wrapper)
- Create: `backend/app/tools/verify_url.py` (URL + text fragment verification)
- Create: `backend/app/tools/save_fact.py` (schema-validated save tool)
- Create: `backend/tests/test_fact_gatherer.py`

**Step 1:** Write test: save_fact tool validates schema, rejects facts without applies_to
**Step 2:** Run test, verify fails
**Step 3:** Implement save_fact tool — Pydantic validation, auto-generates UUID, timestamps
**Step 4:** Write test: verify_url fetches URL, checks if quoted text exists on page
**Step 5:** Run test, verify fails (use httpx mock)
**Step 6:** Implement verify_url tool:
  - Fetch URL with httpx
  - Search page content for exact quote text
  - Generate `#:~:text=` highlight URL
  - Return: url_accessible, text_found_at_url, highlight_url
**Step 7:** Implement Tavily search wrapper tool
**Step 8:** Build LangGraph fact_gatherer agent:
  - State: query, search_results, verified_facts, errors
  - Nodes: search → extract_claims → verify_each → save_verified
  - Tools: tavily_search, verify_url, save_fact
  - System prompt: verbatim from fact-gatherer skill (precision extraction, no interpretation)
**Step 9:** Write integration test: query → search → verify → save → fact in store
**Step 10:** Run tests, verify pass
**Step 11:** Commit: `feat: fact gatherer agent with search, verification, and schema-validated save`

---

## Task 3: Analysis Agent (LangGraph)

**Files:**
- Create: `backend/app/agents/analyzer.py`
- Create: `backend/app/tools/query_facts.py` (read-only fact store access)
- Create: `backend/app/tools/request_facts.py` (request more from gatherer)
- Create: `backend/tests/test_analyzer.py`

**Step 1:** Write test: query_facts tool retrieves facts by keyword, respects applies_to boundaries
**Step 2:** Run test, verify fails
**Step 3:** Implement query_facts — text search over fact store, filters by relevance, returns structured results with context boundaries
**Step 4:** Write test: request_facts sends request to gatherer, returns [NO DATA] when nothing found
**Step 5:** Run test, verify fails
**Step 6:** Implement request_facts — dispatches to fact gatherer, waits for results or returns explicit "data not available"
**Step 7:** Build LangGraph analyzer agent:
  - State: claim_to_verify, relevant_facts, analysis, confidence_assessment
  - Nodes: retrieve_facts → assess_evidence → compute_confidence → format_result
  - Tools: query_facts, request_facts (NO web search tools)
  - System prompt: reasoning only, must cite fact IDs, respects context boundaries
  - Confidence scoring: based on # of corroborating sources, URL verification status, text-match quality, context boundary alignment
**Step 8:** Run tests, verify pass
**Step 9:** Commit: `feat: analysis agent with fact store queries and confidence scoring`

---

## Task 4: Verification Pipeline (Orchestrator Graph)

**Files:**
- Create: `backend/app/agents/orchestrator.py`
- Create: `backend/tests/test_orchestrator.py`

**Step 1:** Write test: orchestrator receives claim text, returns structured verification result with confidence score
**Step 2:** Run test, verify fails
**Step 3:** Build main LangGraph orchestrator:
  - State: claim_text, document_context, fact_gatherer_results, analysis_results, final_verification
  - Nodes:
    1. `parse_claim` — extract the specific factual claim from selected text
    2. `gather_facts` — invoke fact gatherer agent for the claim
    3. `analyze_evidence` — invoke analysis agent with gathered facts
    4. `format_response` — produce frontend-ready verification result:
      ```python
      class VerificationResult(BaseModel):
          claim: str
          verified: bool
          confidence_score: float  # 0.0-1.0
          confidence_label: str    # "High Confidence" / "Medium" / "Low"
          direct_quote: str        # Best matching source quote
          source_url: str          # Verified URL
          source_url_highlight: str  # URL with #:~:text= fragment
          source_name: str
          in_context: list[str]     # What this evidence applies to
          out_of_context: list[str] # What this evidence does NOT apply to
          methodology_note: str | None
      ```
  - Conditional edges: if fact gatherer returns [NO DATA], skip analysis, return low-confidence "Unable to verify"
**Step 4:** Run tests, verify pass
**Step 5:** Commit: `feat: verification pipeline orchestrating fact gatherer and analysis agents`

---

## Task 5: CopilotKit AG-UI Integration

**Files:**
- Create: `backend/app/copilotkit_handler.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_copilotkit_handler.py`

**Step 1:** Write test: CopilotKit runtime handles verify-source action, returns VerificationResult
**Step 2:** Run test, verify fails
**Step 3:** Install copilotkit Python SDK: `pip install copilotkit`
**Step 4:** Implement CopilotKit handler:
  - Mount CopilotKit runtime on FastAPI
  - Register `verify-source` action → invokes orchestrator graph
  - Stream intermediate states via AG-UI (searching... → verifying... → analyzing... → complete)
  - Register `useCopilotReadable` state for document content
**Step 5:** Run tests, verify pass
**Step 6:** Commit: `feat: CopilotKit AG-UI runtime with verify-source action`

---

## Task 6: Connect Frontend to Real Backend

**Files:**
- Modify: `src/app/api/copilotkit/route.ts` (proxy to Python backend)
- Modify: `src/context/SelectionContext.tsx` (remove mock, use real verification)
- Modify: `src/components/CopilotProvider.tsx` (point to backend URL)
- Modify: `src/components/EvidencePanel.tsx` (display real data + highlight URLs)
- Create: `.env.local` updates

**Step 1:** Update Next.js CopilotKit route to proxy to Python backend
**Step 2:** Remove mock verification data from SelectionContext
**Step 3:** Update EvidencePanel to render:
  - Real confidence scores from the pipeline
  - Clickable source URLs with text highlight fragments
  - Context boundaries (applies to / does not apply to) in a collapsible section
  - "Unable to verify" state when [NO DATA]
**Step 4:** Add loading states for the verification pipeline (searching → verifying → complete)
**Step 5:** Test end-to-end: select text → backend verification → evidence panel update
**Step 6:** Commit: `feat: connect frontend to real verification pipeline`

---

## Task 7: End-to-End Testing + Documentation

**Files:**
- Create: `backend/tests/test_e2e.py`
- Modify: `README.md`
- Create: `docs/architecture.md`
- Create: `docker-compose.yml` (optional: for easy local dev)

**Step 1:** Write E2E test: claim text → fact gathering → verification → analysis → frontend-ready result
**Step 2:** Run test, verify pass
**Step 3:** Update README: setup instructions for both frontend and backend, env vars needed
**Step 4:** Write architecture doc explaining agent separation philosophy
**Step 5:** Commit: `feat: e2e tests and architecture documentation`
**Step 6:** Push all to GitHub

---

## Confidence Scoring Algorithm

```python
def compute_confidence(facts: list[VerifiedFact], claim: str) -> float:
    if not facts:
        return 0.0

    scores = []
    for fact in facts:
        base = 0.0

        # URL verified and accessible
        if fact.url_accessible:
            base += 0.3

        # Exact text found at URL
        if fact.text_found_at_url:
            base += 0.3

        # Verification status
        if fact.verified == "YES":
            base += 0.2
        elif fact.verified == "PARTIAL":
            base += 0.1

        # Context alignment (claim matches in_context scope)
        if claim_in_scope(claim, fact.in_context):
            base += 0.2

        scores.append(min(base, 1.0))

    # Multiple corroborating sources boost confidence
    avg = sum(scores) / len(scores)
    corroboration_bonus = min(0.1 * (len(scores) - 1), 0.2)

    return min(avg + corroboration_bonus, 1.0)
```

Label thresholds:
- ≥ 0.80 → "High Confidence"
- ≥ 0.50 → "Medium Confidence"
- < 0.50 → "Low Confidence"

---

## Environment Variables

```
# Backend
TAVILY_API_KEY=tvly-xxx
OPENAI_API_KEY=sk-xxx          # or ANTHROPIC_API_KEY for Claude
FACT_STORE_PATH=./data/facts.json

# Frontend
NEXT_PUBLIC_COPILOTKIT_BACKEND_URL=http://localhost:8000
```

---

## Development Approach

- **Agent separation is LAW:** Fact gatherers NEVER analyze. Analyzers NEVER search the web.
- **Schema validation on every save:** No unstructured data enters the fact store.
- **URL verification is mandatory:** Every fact must have url_accessible and text_found_at_url set.
- **[NO DATA] propagates:** If facts don't exist, the frontend shows "Unable to verify" — never a fabricated score.
- **TDD throughout:** Every component gets tests first.
- **Text fragment URLs:** `#:~:text=` syntax for one-click source verification in browser.
