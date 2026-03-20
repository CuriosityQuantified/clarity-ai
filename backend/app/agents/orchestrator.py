"""Orchestrator pipeline — coordinates fact gathering → analysis → response.

Main LangGraph graph that takes a claim, gathers facts (stub for now),
runs the analysis agent, and formats a VerificationResult.
"""

from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import StateGraph, END

from app.models import VerifiedFact, FactStore, VerificationResult
from app.fact_store import search_facts
from app.agents.analyzer import (
    build_analyzer_graph,
    compute_confidence,
    confidence_label,
    claim_out_of_scope,
)


class OrchestratorState(TypedDict):
    claim_text: str
    document_context: str
    gatherer_results: List[Dict[str, Any]]
    analysis_results: Dict[str, Any]
    final_result: Optional[Dict[str, Any]]


def _parse_claim(state: OrchestratorState) -> dict:
    """Extract and clean the claim text."""
    return {"claim_text": state["claim_text"].strip()}


def _gather_facts(state: OrchestratorState, *, store: FactStore) -> dict:
    """Gather facts for the claim.

    Currently a stub that searches the existing fact store.
    The real fact gatherer (built by CC) will search the web and
    populate the store. For now, we simulate by searching what's there.
    """
    claim = state["claim_text"]
    words = claim.split()
    keywords = [w for w in words if len(w) > 3]

    all_facts: list[VerifiedFact] = []
    seen_ids: set[str] = set()

    for kw in keywords[:8]:
        for fact in search_facts(store, kw):
            if fact.id not in seen_ids:
                all_facts.append(fact)
                seen_ids.add(fact.id)

    return {
        "gatherer_results": [f.model_dump(by_alias=True) for f in all_facts],
    }


def _should_skip_analysis(state: OrchestratorState) -> str:
    """Conditional edge: skip analysis if no facts found."""
    if not state["gatherer_results"]:
        return "format_no_data"
    return "analyze_evidence"


def _analyze_evidence(state: OrchestratorState, *, store: FactStore) -> dict:
    """Run the analysis agent synchronously (invoke, not ainvoke)."""
    claim = state["claim_text"]

    # Use the analyzer's building blocks directly for deterministic results
    facts = [VerifiedFact.model_validate(fd) for fd in state["gatherer_results"]]

    # Filter out facts where claim is out of scope
    in_scope_facts = [
        f for f in facts if not claim_out_of_scope(claim, f.out_of_context)
    ]

    score = compute_confidence(in_scope_facts, claim)

    return {
        "analysis_results": {
            "facts": [f.model_dump(by_alias=True) for f in in_scope_facts],
            "confidence_score": score,
            "confidence_label": confidence_label(score),
        },
    }


def _format_response(state: OrchestratorState) -> dict:
    """Format the final VerificationResult from analysis results."""
    analysis = state["analysis_results"]
    facts_data = analysis.get("facts", [])
    score = analysis.get("confidence_score", 0.0)
    label = analysis.get("confidence_label", "Low Confidence")
    claim = state["claim_text"]

    if facts_data:
        best = facts_data[0]
        result = VerificationResult(
            claim=claim,
            verified=score >= 0.5,
            confidence_score=score,
            confidence_label=label,
            direct_quote=best.get("quote", ""),
            source_url=best.get("sourceUrl", ""),
            highlight_url=best.get("highlightUrl", ""),
            source_name=best.get("publication") or best.get("author") or "Unknown",
            in_context=best.get("inContext", []),
            out_of_context=best.get("outOfContext", []),
            methodology_note=None,
        )
    else:
        result = _no_data_result(claim)

    return {"final_result": result.model_dump(by_alias=True)}


def _format_no_data(state: OrchestratorState) -> dict:
    """Format an 'unable to verify' result when no facts are available."""
    result = _no_data_result(state["claim_text"])
    return {"final_result": result.model_dump(by_alias=True)}


def _no_data_result(claim: str) -> VerificationResult:
    return VerificationResult(
        claim=claim,
        verified=False,
        confidence_score=0.0,
        confidence_label="Low Confidence — Unable to verify",
        direct_quote="",
        source_url="",
        highlight_url="",
        source_name="No sources found",
        in_context=[],
        out_of_context=[],
        methodology_note="No verified facts available for this claim.",
    )


def build_orchestrator_graph(store: FactStore) -> Any:
    """Build the orchestrator LangGraph pipeline."""

    def gather(state: OrchestratorState) -> dict:
        return _gather_facts(state, store=store)

    def analyze(state: OrchestratorState) -> dict:
        return _analyze_evidence(state, store=store)

    graph = StateGraph(OrchestratorState)
    graph.add_node("parse_claim", _parse_claim)
    graph.add_node("gather_facts", gather)
    graph.add_node("analyze_evidence", analyze)
    graph.add_node("format_response", _format_response)
    graph.add_node("format_no_data", _format_no_data)

    graph.set_entry_point("parse_claim")
    graph.add_edge("parse_claim", "gather_facts")
    graph.add_conditional_edges(
        "gather_facts",
        _should_skip_analysis,
        {
            "analyze_evidence": "analyze_evidence",
            "format_no_data": "format_no_data",
        },
    )
    graph.add_edge("analyze_evidence", "format_response")
    graph.add_edge("format_response", END)
    graph.add_edge("format_no_data", END)

    return graph.compile()
