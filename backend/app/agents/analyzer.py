"""Analysis agent — reasons ONLY over verified facts from the fact store.

Never searches the web. Checks in_context/out_of_context boundaries before
using any fact. If a fact's out_of_context matches the claim, EXCLUDES it.
"""

from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import StateGraph, END

from app.models import VerifiedFact, FactStore
from app.fact_store import search_facts, get_facts_by_context


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------


def claim_in_scope(claim: str, in_context: list[str]) -> bool:
    """Check if claim falls within any of the in_context scopes."""
    claim_lower = claim.lower()
    return any(ctx.lower() in claim_lower or claim_lower in ctx.lower() for ctx in in_context)


def claim_out_of_scope(claim: str, out_of_context: list[str]) -> bool:
    """Check if claim matches any out_of_context exclusion."""
    claim_lower = claim.lower()
    return any(ctx.lower() in claim_lower or claim_lower in ctx.lower() for ctx in out_of_context)


def confidence_label(score: float) -> str:
    if score >= 0.80:
        return "High Confidence"
    if score >= 0.50:
        return "Medium Confidence"
    return "Low Confidence"


def query_facts_tool(
    store: FactStore,
    query: str,
    context_filter: Optional[str] = None,
) -> list[VerifiedFact]:
    """Search the fact store. Optionally filter by in_context match."""
    if context_filter:
        candidates = get_facts_by_context(store, context_filter)
        q = query.lower()
        return [f for f in candidates if q in f.quote.lower() or any(q in t.lower() for t in f.tags)]
    return search_facts(store, query)


def compute_confidence(
    facts: list[VerifiedFact],
    claim: str,
    url_accessible: Optional[Dict[str, bool]] = None,
    text_found_at_url: Optional[Dict[str, bool]] = None,
) -> float:
    """Confidence scoring per the spec.

    +0.3 URL accessible
    +0.3 text found at URL
    +0.2 verification status == verified
    +0.2 context alignment (claim matches in_context)
    Corroboration bonus: up to +0.2 for multiple sources
    Penalty: if claim matches out_of_context, return 0.0 for that fact.
    """
    if not facts:
        return 0.0

    url_accessible = url_accessible or {}
    text_found_at_url = text_found_at_url or {}

    scores: list[float] = []
    for fact in facts:
        # If claim matches out_of_context, exclude this fact entirely
        if claim_out_of_scope(claim, fact.out_of_context):
            continue

        base = 0.0

        if url_accessible.get(fact.id, False):
            base += 0.3

        if text_found_at_url.get(fact.id, False):
            base += 0.3

        if fact.verification_status == "verified":
            base += 0.2
        elif fact.verification_status == "pending":
            base += 0.1

        if claim_in_scope(claim, fact.in_context):
            base += 0.2

        scores.append(min(base, 1.0))

    if not scores:
        return 0.0

    avg = sum(scores) / len(scores)
    corroboration_bonus = min(0.1 * (len(scores) - 1), 0.2)
    return min(avg + corroboration_bonus, 1.0)


# ---------------------------------------------------------------------------
# LangGraph state + nodes
# ---------------------------------------------------------------------------


class AnalyzerState(TypedDict):
    claim_to_verify: str
    relevant_facts: List[Dict[str, Any]]
    analysis: str
    confidence_assessment: float


def retrieve_facts(state: AnalyzerState, *, store: FactStore) -> dict:
    """Retrieve facts relevant to the claim from the fact store."""
    claim = state["claim_to_verify"]
    # Search using key words from the claim
    words = claim.split()
    keywords = [w for w in words if len(w) > 3]

    all_facts: list[VerifiedFact] = []
    seen_ids: set[str] = set()

    for kw in keywords[:8]:
        for fact in search_facts(store, kw):
            if fact.id not in seen_ids:
                # Exclude facts where claim matches out_of_context
                if not claim_out_of_scope(claim, fact.out_of_context):
                    all_facts.append(fact)
                    seen_ids.add(fact.id)

    return {
        "relevant_facts": [f.model_dump(by_alias=True) for f in all_facts],
    }


def assess_evidence(state: AnalyzerState) -> dict:
    """Assess the evidence quality from retrieved facts."""
    facts_data = state["relevant_facts"]
    claim = state["claim_to_verify"]

    if not facts_data:
        return {
            "analysis": f"No verified facts found for claim: '{claim}'. Unable to verify.",
        }

    fact_summaries = []
    for fd in facts_data:
        quote = fd.get("quote", "")
        source = fd.get("publication") or fd.get("author") or "Unknown"
        status = fd.get("verificationStatus", "unknown")
        in_ctx = fd.get("inContext", [])
        fact_summaries.append(
            f"- [{status}] \"{quote[:100]}...\" (Source: {source}, Context: {', '.join(in_ctx)})"
        )

    analysis = (
        f"Found {len(facts_data)} relevant fact(s) for claim: '{claim}'\n\n"
        + "Evidence:\n"
        + "\n".join(fact_summaries)
    )
    return {"analysis": analysis}


def compute_confidence_node(state: AnalyzerState) -> dict:
    """Compute the confidence score from the retrieved facts."""
    facts_data = state["relevant_facts"]
    claim = state["claim_to_verify"]

    if not facts_data:
        return {"confidence_assessment": 0.0}

    facts = [VerifiedFact.model_validate(fd) for fd in facts_data]
    score = compute_confidence(facts, claim)
    return {"confidence_assessment": score}


def format_result(state: AnalyzerState) -> dict:
    """No-op terminal node — state is the result."""
    return {}


# ---------------------------------------------------------------------------
# Graph builder
# ---------------------------------------------------------------------------


def build_analyzer_graph(store: FactStore) -> Any:
    """Build the analysis agent LangGraph StateGraph."""

    def _retrieve(state: AnalyzerState) -> dict:
        return retrieve_facts(state, store=store)

    graph = StateGraph(AnalyzerState)
    graph.add_node("retrieve_facts", _retrieve)
    graph.add_node("assess_evidence", assess_evidence)
    graph.add_node("compute_confidence", compute_confidence_node)
    graph.add_node("format_result", format_result)

    graph.set_entry_point("retrieve_facts")
    graph.add_edge("retrieve_facts", "assess_evidence")
    graph.add_edge("assess_evidence", "compute_confidence")
    graph.add_edge("compute_confidence", "format_result")
    graph.add_edge("format_result", END)

    return graph.compile()
