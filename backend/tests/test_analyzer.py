"""Tests for the analysis agent — fact querying, confidence scoring, context boundaries."""

import pytest

from app.models import VerifiedFact, FactStore, VerificationResult
from app.fact_store import add_fact
from app.agents.analyzer import (
    query_facts_tool,
    compute_confidence,
    claim_in_scope,
    confidence_label,
    build_analyzer_graph,
)


@pytest.fixture
def populated_store(sample_fact_data, sample_fact_data_2):
    store = FactStore(last_updated="2025-12-01T10:00:00Z")
    store = add_fact(store, VerifiedFact(**sample_fact_data))
    store = add_fact(store, VerifiedFact(**sample_fact_data_2))
    return store


class TestQueryFactsTool:
    def test_returns_matching_facts(self, populated_store):
        results = query_facts_tool(populated_store, "diagnostics")
        assert len(results) >= 1
        assert any(f.id == "fact-001" for f in results)

    def test_returns_empty_for_no_match(self, populated_store):
        results = query_facts_tool(populated_store, "quantum physics")
        assert results == []

    def test_filters_by_context(self, populated_store):
        results = query_facts_tool(populated_store, "mammography", context_filter="radiology")
        assert len(results) == 1
        assert results[0].id == "fact-002"


class TestClaimInScope:
    def test_claim_matches_context(self):
        assert claim_in_scope("AI in medical diagnostics", ["medical diagnostics", "AI in healthcare"])

    def test_claim_no_match(self):
        assert not claim_in_scope("quantum computing", ["medical diagnostics"])

    def test_partial_match(self):
        assert claim_in_scope("radiology AI systems", ["radiology"])


class TestComputeConfidence:
    def test_no_facts_returns_zero(self):
        assert compute_confidence([], "any claim") == 0.0

    def test_perfect_fact_high_confidence(self):
        fact = VerifiedFact(
            id="f1",
            quote="AI improves diagnostics by 23.4%",
            source_url="https://example.com",
            highlight_url="https://example.com#:~:text=AI",
            in_context=["medical diagnostics"],
            out_of_context=["consumer AI"],
            date_retrieved="2025-12-01T10:00:00Z",
            confidence=0.95,
            verification_status="verified",
            gathered_by="test",
        )
        # A fully verified fact with url_accessible=True, text_found=True, in_context match
        # should score high
        score = compute_confidence(
            [fact],
            "AI improves diagnostics",
            url_accessible={fact.id: True},
            text_found_at_url={fact.id: True},
        )
        assert score >= 0.8

    def test_corroboration_bonus(self, sample_fact_data, sample_fact_data_2):
        f1 = VerifiedFact(**sample_fact_data)
        f2 = VerifiedFact(**sample_fact_data_2)
        score_one = compute_confidence([f1], "AI diagnostics")
        score_two = compute_confidence([f1, f2], "AI diagnostics")
        assert score_two > score_one

    def test_out_of_context_reduces_confidence(self):
        fact = VerifiedFact(
            id="f1",
            quote="AI improves diagnostics",
            source_url="https://example.com",
            highlight_url="https://example.com#:~:text=AI",
            in_context=["radiology only"],
            out_of_context=["general healthcare claims"],
            date_retrieved="2025-12-01T10:00:00Z",
            confidence=0.95,
            verification_status="verified",
            gathered_by="test",
        )
        # Claim is about general healthcare, which is in out_of_context
        score = compute_confidence([fact], "general healthcare claims")
        assert score < 0.5  # Should be low since claim matches out_of_context


class TestConfidenceLabel:
    def test_high(self):
        assert confidence_label(0.85) == "High Confidence"

    def test_medium(self):
        assert confidence_label(0.65) == "Medium Confidence"

    def test_low(self):
        assert confidence_label(0.3) == "Low Confidence"


class TestAnalyzerGraph:
    def test_graph_builds(self):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        graph = build_analyzer_graph(store)
        assert graph is not None

    @pytest.mark.asyncio
    async def test_graph_runs_with_no_facts(self):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        graph = build_analyzer_graph(store)
        result = await graph.ainvoke({
            "claim_to_verify": "AI improves diagnostics by 23%",
            "relevant_facts": [],
            "analysis": "",
            "confidence_assessment": 0.0,
        })
        assert result["confidence_assessment"] == 0.0

    @pytest.mark.asyncio
    async def test_graph_runs_with_facts(self, populated_store):
        graph = build_analyzer_graph(populated_store)
        result = await graph.ainvoke({
            "claim_to_verify": "AI-assisted diagnostic systems achieved 23.4% accuracy improvement",
            "relevant_facts": [],
            "analysis": "",
            "confidence_assessment": 0.0,
        })
        assert result["confidence_assessment"] > 0.0
        assert len(result["relevant_facts"]) > 0
