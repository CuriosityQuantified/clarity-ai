"""JSON-backed fact store with search, add, and context filtering."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone

from app.models import FactStore, VerifiedFact


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_store(path: str) -> FactStore:
    """Load a FactStore from a JSON file. Returns empty store if file missing."""
    if not os.path.exists(path):
        return FactStore(last_updated=_now_iso())
    with open(path, "r") as f:
        data = json.load(f)
    return FactStore.model_validate(data)


def save_store(store: FactStore, path: str) -> None:
    """Persist a FactStore to a JSON file (camelCase keys)."""
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w") as f:
        json.dump(store.model_dump(by_alias=True), f, indent=2)


def add_fact(store: FactStore, fact: VerifiedFact) -> FactStore:
    """Add a fact to the store. Deduplicates by source_url + quote."""
    for existing in store.facts:
        if existing.source_url == fact.source_url and existing.quote == fact.quote:
            return store  # duplicate — no-op
    store.facts.append(fact)
    store.last_updated = _now_iso()
    return store


def search_facts(store: FactStore, query: str) -> list[VerifiedFact]:
    """Case-insensitive substring search across quote, tags, contexts, author, publication."""
    q = query.lower()
    results: list[VerifiedFact] = []
    for fact in store.facts:
        if q in fact.quote.lower():
            results.append(fact)
            continue
        if any(q in tag.lower() for tag in fact.tags):
            results.append(fact)
            continue
        if any(q in ctx.lower() for ctx in fact.in_context):
            results.append(fact)
            continue
        if any(q in ctx.lower() for ctx in fact.out_of_context):
            results.append(fact)
            continue
        if fact.author and q in fact.author.lower():
            results.append(fact)
            continue
        if fact.publication and q in fact.publication.lower():
            results.append(fact)
            continue
    return results


def get_facts_by_context(store: FactStore, context: str) -> list[VerifiedFact]:
    """Return facts whose in_context includes the given context (case-insensitive)."""
    c = context.lower()
    return [
        fact
        for fact in store.facts
        if any(c in ctx.lower() for ctx in fact.in_context)
    ]
