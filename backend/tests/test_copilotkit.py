"""Tests for CopilotKit AG-UI integration."""

import json
import pytest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.models import FactStore, VerifiedFact
from app.fact_store import add_fact, save_store
from app.copilotkit_handler import _verify_source_handler


@pytest.fixture
def client():
    return TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestCopilotKitEndpoint:
    def test_copilotkit_info_endpoint(self, client):
        """The /copilotkit/info endpoint should list available actions."""
        response = client.post(
            "/copilotkit/info",
            json={},
        )
        assert response.status_code == 200
        data = response.json()
        assert "actions" in data
        action_names = [a["name"] for a in data["actions"]]
        assert "verify-source" in action_names


class TestVerifySourceHandler:
    @pytest.mark.asyncio
    async def test_handler_with_empty_store(self, tmp_path):
        """Handler should return low confidence when no facts exist."""
        store_path = str(tmp_path / "facts.json")
        empty_store = FactStore(last_updated="2025-12-01T10:00:00Z")
        save_store(empty_store, store_path)

        with patch("app.copilotkit_handler.FACT_STORE_PATH", store_path):
            result = await _verify_source_handler(
                claim="AI improves diagnostics by 23%"
            )

        assert result["verified"] is False
        assert result["confidenceScore"] == 0.0

    @pytest.mark.asyncio
    async def test_handler_with_matching_facts(self, tmp_path, sample_fact_data):
        """Handler should return verification result when facts match."""
        store_path = str(tmp_path / "facts.json")
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        store = add_fact(store, VerifiedFact(**sample_fact_data))
        save_store(store, store_path)

        with patch("app.copilotkit_handler.FACT_STORE_PATH", store_path):
            result = await _verify_source_handler(
                claim="AI-assisted diagnostic systems achieved 23.4% accuracy improvement"
            )

        assert "claim" in result
        assert "confidenceScore" in result
        assert "directQuote" in result
        assert result["confidenceScore"] > 0.0

    @pytest.mark.asyncio
    async def test_handler_returns_camel_case_keys(self, tmp_path, sample_fact_data):
        """Result keys should be camelCase for frontend consumption."""
        store_path = str(tmp_path / "facts.json")
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        store = add_fact(store, VerifiedFact(**sample_fact_data))
        save_store(store, store_path)

        with patch("app.copilotkit_handler.FACT_STORE_PATH", store_path):
            result = await _verify_source_handler(claim="diagnostic systems accuracy")

        # Should use camelCase keys
        for key in ["confidenceScore", "confidenceLabel", "directQuote",
                     "sourceUrl", "highlightUrl", "sourceName",
                     "inContext", "outOfContext"]:
            assert key in result, f"Missing camelCase key: {key}"
