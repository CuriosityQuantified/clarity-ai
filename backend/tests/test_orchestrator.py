"""Tests for the orchestrator pipeline — claim → gather → analyze → result."""

import pytest

from app.models import VerifiedFact, FactStore, VerificationResult
from app.fact_store import add_fact
from app.agents.orchestrator import build_orchestrator_graph, OrchestratorState


@pytest.fixture
def populated_store(sample_fact_data, sample_fact_data_2):
    store = FactStore(last_updated="2025-12-01T10:00:00Z")
    store = add_fact(store, VerifiedFact(**sample_fact_data))
    store = add_fact(store, VerifiedFact(**sample_fact_data_2))
    return store


class TestOrchestratorGraph:
    def test_graph_builds(self, populated_store):
        graph = build_orchestrator_graph(populated_store)
        assert graph is not None

    @pytest.mark.asyncio
    async def test_end_to_end_with_matching_claim(self, populated_store):
        graph = build_orchestrator_graph(populated_store)
        result = await graph.ainvoke({
            "claim_text": "AI-assisted diagnostic systems achieved 23.4% accuracy improvement",
            "document_context": "Healthcare AI review paper",
            "gatherer_results": [],
            "analysis_results": {},
            "final_result": None,
        })
        assert result["final_result"] is not None
        vr = VerificationResult.model_validate(result["final_result"])
        assert vr.confidence_score > 0.0
        assert vr.claim != ""
        assert vr.source_name != ""

    @pytest.mark.asyncio
    async def test_no_data_returns_unable_to_verify(self):
        empty_store = FactStore(last_updated="2025-12-01T10:00:00Z")
        graph = build_orchestrator_graph(empty_store)
        result = await graph.ainvoke({
            "claim_text": "Quantum computers can cure cancer",
            "document_context": "",
            "gatherer_results": [],
            "analysis_results": {},
            "final_result": None,
        })
        assert result["final_result"] is not None
        vr = VerificationResult.model_validate(result["final_result"])
        assert vr.verified is False
        assert vr.confidence_score < 0.5
        assert "unable" in vr.confidence_label.lower() or "low" in vr.confidence_label.lower()

    @pytest.mark.asyncio
    async def test_out_of_context_claim_low_confidence(self, populated_store):
        graph = build_orchestrator_graph(populated_store)
        # "consumer AI products" is in out_of_context for fact-001
        result = await graph.ainvoke({
            "claim_text": "consumer AI products improved by 23%",
            "document_context": "",
            "gatherer_results": [],
            "analysis_results": {},
            "final_result": None,
        })
        vr = VerificationResult.model_validate(result["final_result"])
        # Should be low confidence since relevant facts are out-of-context
        assert vr.confidence_score < 0.8

    @pytest.mark.asyncio
    async def test_result_has_required_fields(self, populated_store):
        graph = build_orchestrator_graph(populated_store)
        result = await graph.ainvoke({
            "claim_text": "mammography AI reduced false negatives",
            "document_context": "Radiology study",
            "gatherer_results": [],
            "analysis_results": {},
            "final_result": None,
        })
        vr = VerificationResult.model_validate(result["final_result"])
        assert isinstance(vr.in_context, list)
        assert isinstance(vr.out_of_context, list)
        assert vr.highlight_url != ""
        assert vr.source_url != ""
