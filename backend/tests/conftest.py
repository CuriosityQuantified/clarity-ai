import pytest
import tempfile
import os


@pytest.fixture
def tmp_fact_store(tmp_path):
    """Return a path to a temporary fact store JSON file."""
    return str(tmp_path / "facts.json")


@pytest.fixture
def sample_fact_data():
    """Return valid fact data matching the VerifiedFact schema."""
    return {
        "id": "fact-001",
        "quote": "AI-assisted diagnostic systems achieved 23.4% accuracy improvement",
        "source_url": "https://example.com/article",
        "highlight_url": "https://example.com/article#:~:text=AI-assisted%20diagnostic",
        "in_context": ["medical diagnostics", "AI in healthcare"],
        "out_of_context": ["consumer AI products"],
        "author": "Dr. Sarah Chen",
        "publication": "Nature Medicine",
        "date_published": "2025-11-15",
        "date_retrieved": "2025-12-01T10:00:00Z",
        "confidence": 0.94,
        "verification_status": "verified",
        "tags": ["AI", "healthcare", "diagnostics"],
        "gathered_by": "fact-gatherer-v1",
    }


@pytest.fixture
def sample_fact_data_2():
    """Return a second valid fact for multi-fact tests."""
    return {
        "id": "fact-002",
        "quote": "AI-assisted mammography reduced false-negative rates by 31.2%",
        "source_url": "https://example.com/radiology",
        "highlight_url": "https://example.com/radiology#:~:text=mammography%20reduced",
        "in_context": ["radiology", "mammography screening"],
        "out_of_context": ["general practice", "pediatrics"],
        "author": "Dr. James Wilson",
        "publication": "Radiology, 2025",
        "date_published": "2025-10-10",
        "date_retrieved": "2025-12-01T11:00:00Z",
        "confidence": 0.97,
        "verification_status": "verified",
        "tags": ["radiology", "mammography", "AI"],
        "gathered_by": "fact-gatherer-v1",
    }
