"""Tests for Pydantic models — validates schema constraints and camelCase serialization."""

import pytest
from pydantic import ValidationError

from app.models import VerifiedFact, FactRequest, FactStore, VerificationResult


class TestVerifiedFact:
    def test_valid_fact(self, sample_fact_data):
        fact = VerifiedFact(**sample_fact_data)
        assert fact.id == "fact-001"
        assert fact.confidence == 0.94

    def test_camel_case_serialization(self, sample_fact_data):
        fact = VerifiedFact(**sample_fact_data)
        data = fact.model_dump(by_alias=True)
        assert "sourceUrl" in data
        assert "highlightUrl" in data
        assert "inContext" in data
        assert "outOfContext" in data
        assert "dateRetrieved" in data
        assert "verificationStatus" in data
        assert "gatheredBy" in data
        # snake_case keys should NOT be present when using aliases
        assert "source_url" not in data

    def test_rejects_empty_in_context(self, sample_fact_data):
        sample_fact_data["in_context"] = []
        with pytest.raises(ValidationError, match="in_context"):
            VerifiedFact(**sample_fact_data)

    def test_rejects_empty_out_of_context(self, sample_fact_data):
        sample_fact_data["out_of_context"] = []
        with pytest.raises(ValidationError, match="out_of_context"):
            VerifiedFact(**sample_fact_data)

    def test_rejects_confidence_above_1(self, sample_fact_data):
        sample_fact_data["confidence"] = 1.5
        with pytest.raises(ValidationError):
            VerifiedFact(**sample_fact_data)

    def test_rejects_confidence_below_0(self, sample_fact_data):
        sample_fact_data["confidence"] = -0.1
        with pytest.raises(ValidationError):
            VerifiedFact(**sample_fact_data)

    def test_rejects_invalid_verification_status(self, sample_fact_data):
        sample_fact_data["verification_status"] = "unknown"
        with pytest.raises(ValidationError):
            VerifiedFact(**sample_fact_data)

    def test_accepts_camel_case_input(self, sample_fact_data):
        """Model should accept camelCase keys (from frontend JSON)."""
        fact = VerifiedFact(
            id="fact-003",
            quote="Test quote",
            sourceUrl="https://example.com",
            highlightUrl="https://example.com#:~:text=Test",
            inContext=["test"],
            outOfContext=["not test"],
            dateRetrieved="2025-12-01T10:00:00Z",
            confidence=0.8,
            verificationStatus="verified",
            gatheredBy="test-agent",
        )
        assert fact.source_url == "https://example.com"
        assert fact.verification_status == "verified"


class TestFactRequest:
    def test_valid_request(self):
        req = FactRequest(
            id="req-001",
            query="Find AI diagnostic accuracy stats",
            requested_by="analyzer-v1",
            status="pending",
            timestamp="2025-12-01T10:00:00Z",
        )
        assert req.status == "pending"
        assert req.fulfilled_fact_ids == []

    def test_camel_case_serialization(self):
        req = FactRequest(
            id="req-001",
            query="test",
            requested_by="agent",
            status="fulfilled",
            timestamp="2025-12-01T10:00:00Z",
            fulfilled_fact_ids=["fact-001"],
        )
        data = req.model_dump(by_alias=True)
        assert "requestedBy" in data
        assert "fulfilledFactIds" in data
        assert "notAvailableReason" in data

    def test_rejects_invalid_status(self):
        with pytest.raises(ValidationError):
            FactRequest(
                id="req-001",
                query="test",
                requested_by="agent",
                status="invalid",
                timestamp="2025-12-01T10:00:00Z",
            )


class TestFactStore:
    def test_empty_store(self):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        assert store.facts == []
        assert store.requests == []
        assert store.version == "1.0"

    def test_store_with_facts(self, sample_fact_data):
        fact = VerifiedFact(**sample_fact_data)
        store = FactStore(facts=[fact], last_updated="2025-12-01T10:00:00Z")
        assert len(store.facts) == 1
        data = store.model_dump(by_alias=True)
        assert "lastUpdated" in data


class TestVerificationResult:
    def test_valid_result(self):
        result = VerificationResult(
            claim="AI improves diagnostics",
            verified=True,
            confidence_score=0.94,
            confidence_label="High Confidence",
            direct_quote="AI-assisted diagnostic systems achieved 23.4%",
            source_url="https://example.com/article",
            highlight_url="https://example.com/article#:~:text=AI-assisted",
            source_name="Nature Medicine",
            in_context=["medical diagnostics"],
            out_of_context=["consumer AI"],
            methodology_note="Meta-analysis of 847 studies",
        )
        assert result.verified is True
        data = result.model_dump(by_alias=True)
        assert "confidenceScore" in data
        assert "confidenceLabel" in data
        assert "directQuote" in data
        assert "methodologyNote" in data
