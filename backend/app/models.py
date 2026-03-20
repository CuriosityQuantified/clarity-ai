"""Pydantic models matching the TypeScript fact schema exactly.

JSON serialization uses camelCase aliases to match frontend expectations.
Python code uses snake_case field names.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


def _to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


class _CamelModel(BaseModel):
    """Base model that serializes to camelCase JSON."""

    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
    )


# ---------------------------------------------------------------------------
# Core fact schema — matches src/lib/facts/schema.ts VerifiedFact
# ---------------------------------------------------------------------------


class VerifiedFact(_CamelModel):
    id: str
    quote: str
    source_url: str
    highlight_url: str
    in_context: list[str] = Field(min_length=1)
    out_of_context: list[str] = Field(min_length=1)
    author: str | None = None
    publication: str | None = None
    date_published: str | None = None
    date_retrieved: str
    confidence: float = Field(ge=0.0, le=1.0)
    verification_status: Literal["verified", "pending", "failed", "unavailable"]
    tags: list[str] = Field(default_factory=list)
    gathered_by: str


# ---------------------------------------------------------------------------
# Fact request — matches src/lib/facts/schema.ts FactRequest
# ---------------------------------------------------------------------------


class FactRequest(_CamelModel):
    id: str
    query: str
    requested_by: str
    status: Literal["pending", "fulfilled", "not_available"]
    timestamp: str
    fulfilled_fact_ids: list[str] = Field(default_factory=list)
    not_available_reason: str | None = None


# ---------------------------------------------------------------------------
# Fact store — matches src/lib/facts/schema.ts FactStore
# ---------------------------------------------------------------------------


class FactStore(_CamelModel):
    facts: list[VerifiedFact] = Field(default_factory=list)
    requests: list[FactRequest] = Field(default_factory=list)
    last_updated: str = ""
    version: str = "1.0"


# ---------------------------------------------------------------------------
# Analysis-agent consumption model (subset of fact data)
# ---------------------------------------------------------------------------


class FactQueryResult(_CamelModel):
    """Subset returned to the analysis agent when querying the fact store."""

    facts: list[VerifiedFact]
    total_matches: int
    query: str


# ---------------------------------------------------------------------------
# Verification result — output of the orchestrator pipeline
# ---------------------------------------------------------------------------


class VerificationResult(_CamelModel):
    claim: str
    verified: bool
    confidence_score: float = Field(ge=0.0, le=1.0)
    confidence_label: str
    direct_quote: str
    source_url: str
    highlight_url: str
    source_name: str
    in_context: list[str] = Field(default_factory=list)
    out_of_context: list[str] = Field(default_factory=list)
    methodology_note: str | None = None
