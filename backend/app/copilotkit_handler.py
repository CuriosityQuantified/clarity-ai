"""CopilotKit AG-UI integration — mounts runtime on FastAPI.

Registers the 'verify-source' action that invokes the orchestrator pipeline
and streams intermediate states back to the frontend.
"""

from __future__ import annotations

import os

from copilotkit import CopilotKitRemoteEndpoint, Action, LangGraphAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from fastapi import FastAPI

from app.models import FactStore, VerificationResult
from app.fact_store import load_store
from app.agents.orchestrator import build_orchestrator_graph


FACT_STORE_PATH = os.environ.get("FACT_STORE_PATH", "./data/facts.json")


def _get_store() -> FactStore:
    return load_store(FACT_STORE_PATH)


async def _verify_source_handler(claim: str, section: str = "") -> dict:
    """Handle a verify-source action from the frontend."""
    store = _get_store()
    graph = build_orchestrator_graph(store)
    result = await graph.ainvoke({
        "claim_text": claim,
        "document_context": section,
        "gatherer_results": [],
        "analysis_results": {},
        "final_result": None,
    })

    final = result.get("final_result")
    if final:
        return final
    return VerificationResult(
        claim=claim,
        verified=False,
        confidence_score=0.0,
        confidence_label="Low Confidence — Unable to verify",
        direct_quote="",
        source_url="",
        highlight_url="",
        source_name="No sources found",
        methodology_note="Verification pipeline returned no result.",
    ).model_dump(by_alias=True)


verify_source_action = Action(
    name="verify-source",
    description="Verify a claim or piece of text from a research document against verified sources",
    handler=_verify_source_handler,
)


def mount_copilotkit(app: FastAPI) -> None:
    """Mount CopilotKit remote endpoint on the FastAPI app."""
    sdk = CopilotKitRemoteEndpoint(
        actions=[verify_source_action],
    )
    add_fastapi_endpoint(app, sdk, "/copilotkit")
