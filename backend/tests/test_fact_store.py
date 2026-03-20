"""Tests for fact store persistence, search, and deduplication."""

import json

from app.models import VerifiedFact, FactStore
from app.fact_store import load_store, save_store, add_fact, search_facts, get_facts_by_context


class TestLoadSave:
    def test_load_missing_file_returns_empty(self, tmp_fact_store):
        store = load_store(tmp_fact_store)
        assert store.facts == []
        assert store.version == "1.0"

    def test_save_and_load_roundtrip(self, tmp_fact_store, sample_fact_data):
        fact = VerifiedFact(**sample_fact_data)
        store = FactStore(facts=[fact], last_updated="2025-12-01T10:00:00Z")
        save_store(store, tmp_fact_store)
        loaded = load_store(tmp_fact_store)
        assert len(loaded.facts) == 1
        assert loaded.facts[0].id == "fact-001"
        assert loaded.facts[0].quote == fact.quote

    def test_saved_json_uses_camel_case(self, tmp_fact_store, sample_fact_data):
        fact = VerifiedFact(**sample_fact_data)
        store = FactStore(facts=[fact], last_updated="2025-12-01T10:00:00Z")
        save_store(store, tmp_fact_store)
        with open(tmp_fact_store) as f:
            raw = json.load(f)
        assert "sourceUrl" in raw["facts"][0]
        assert "highlightUrl" in raw["facts"][0]
        assert "inContext" in raw["facts"][0]


class TestAddFact:
    def test_add_new_fact(self, sample_fact_data):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        fact = VerifiedFact(**sample_fact_data)
        store = add_fact(store, fact)
        assert len(store.facts) == 1

    def test_deduplicates_by_url_and_quote(self, sample_fact_data):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        fact = VerifiedFact(**sample_fact_data)
        store = add_fact(store, fact)
        store = add_fact(store, fact)  # same fact again
        assert len(store.facts) == 1

    def test_allows_different_facts(self, sample_fact_data, sample_fact_data_2):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        store = add_fact(store, VerifiedFact(**sample_fact_data))
        store = add_fact(store, VerifiedFact(**sample_fact_data_2))
        assert len(store.facts) == 2


class TestSearch:
    def _store_with_facts(self, sample_fact_data, sample_fact_data_2):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        store = add_fact(store, VerifiedFact(**sample_fact_data))
        store = add_fact(store, VerifiedFact(**sample_fact_data_2))
        return store

    def test_search_by_quote(self, sample_fact_data, sample_fact_data_2):
        store = self._store_with_facts(sample_fact_data, sample_fact_data_2)
        results = search_facts(store, "mammography")
        assert len(results) == 1
        assert results[0].id == "fact-002"

    def test_search_by_tag(self, sample_fact_data, sample_fact_data_2):
        store = self._store_with_facts(sample_fact_data, sample_fact_data_2)
        results = search_facts(store, "diagnostics")
        assert len(results) == 1
        assert results[0].id == "fact-001"

    def test_search_by_author(self, sample_fact_data, sample_fact_data_2):
        store = self._store_with_facts(sample_fact_data, sample_fact_data_2)
        results = search_facts(store, "Sarah Chen")
        assert len(results) == 1

    def test_search_case_insensitive(self, sample_fact_data, sample_fact_data_2):
        store = self._store_with_facts(sample_fact_data, sample_fact_data_2)
        results = search_facts(store, "AI")
        assert len(results) == 2

    def test_search_no_results(self, sample_fact_data, sample_fact_data_2):
        store = self._store_with_facts(sample_fact_data, sample_fact_data_2)
        results = search_facts(store, "quantum computing")
        assert len(results) == 0


class TestGetFactsByContext:
    def test_filter_by_context(self, sample_fact_data, sample_fact_data_2):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        store = add_fact(store, VerifiedFact(**sample_fact_data))
        store = add_fact(store, VerifiedFact(**sample_fact_data_2))
        results = get_facts_by_context(store, "radiology")
        assert len(results) == 1
        assert results[0].id == "fact-002"

    def test_context_case_insensitive(self, sample_fact_data):
        store = FactStore(last_updated="2025-12-01T10:00:00Z")
        store = add_fact(store, VerifiedFact(**sample_fact_data))
        results = get_facts_by_context(store, "MEDICAL DIAGNOSTICS")
        assert len(results) == 1
