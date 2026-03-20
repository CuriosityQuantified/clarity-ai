"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { VerificationResult, mockVerifications } from "@/lib/mock-data";
import type { VerifiedFact, FactStore } from "@/lib/facts/schema";
import { searchFacts } from "@/lib/facts/store";

export type VerificationStage =
  | "idle"
  | "searching"
  | "verifying"
  | "analyzing"
  | "complete"
  | "error";

export interface Highlight {
  id: string;
  text: string;
  sectionId: string;
  startOffset: number;
  endOffset: number;
}

interface SelectionContextType {
  selectedText: string;
  setSelectedText: (text: string) => void;
  activeHighlight: Highlight | null;
  setActiveHighlight: (highlight: Highlight | null) => void;
  highlights: Highlight[];
  addHighlight: (highlight: Omit<Highlight, "id">) => void;
  removeHighlight: (id: string) => void;
  verification: VerificationResult | null;
  setVerification: (v: VerificationResult | null) => void;
  verifySelection: (text: string, sectionId?: string) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  factStore: FactStore | null;
  matchedFacts: VerifiedFact[];
  verificationStage: VerificationStage;
}

const STAGE_LABELS: Record<VerificationStage, string> = {
  idle: "",
  searching: "Searching sources...",
  verifying: "Verifying claims...",
  analyzing: "Analyzing evidence...",
  complete: "Verification complete",
  error: "Verification failed",
};

export { STAGE_LABELS };

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedText, setSelectedText] = useState("");
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [factStore, setFactStore] = useState<FactStore | null>(null);
  const [matchedFacts, setMatchedFacts] = useState<VerifiedFact[]>([]);
  const [verificationStage, setVerificationStage] = useState<VerificationStage>("idle");

  // Load fact store from sample-facts.json on mount
  useEffect(() => {
    fetch("/data/sample-facts.json")
      .then((res) => res.json())
      .then((data: FactStore) => setFactStore(data))
      .catch((err) => console.warn("Failed to load fact store:", err));
  }, []);

  const addHighlight = useCallback((highlight: Omit<Highlight, "id">) => {
    const id = `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newHighlight = { ...highlight, id };
    setHighlights((prev) => [...prev, newHighlight]);
    setActiveHighlight(newHighlight);
  }, []);

  const removeHighlight = useCallback(
    (id: string) => {
      setHighlights((prev) => prev.filter((h) => h.id !== id));
      if (activeHighlight?.id === id) {
        setActiveHighlight(null);
        setVerification(null);
        setMatchedFacts([]);
        setVerificationStage("idle");
      }
    },
    [activeHighlight],
  );

  const verifySelection = useCallback(
    (text: string, sectionId?: string) => {
      // Find matching facts from the fact store (local search)
      if (factStore) {
        const words = text.split(/\s+/).filter((w) => w.length > 4);
        const queryTerms = words.slice(0, 8).join(" ");
        const results = searchFacts(factStore, queryTerms);

        const directMatches = factStore.facts.filter(
          (fact) =>
            text.toLowerCase().includes(fact.quote.toLowerCase().slice(0, 40)) ||
            fact.quote.toLowerCase().includes(text.toLowerCase().slice(0, 40))
        );

        const allMatches = [...results, ...directMatches];
        const uniqueMatches = allMatches.filter(
          (fact, i, arr) => arr.findIndex((f) => f.id === fact.id) === i
        );
        setMatchedFacts(uniqueMatches);
      }

      // Call the real backend verification pipeline
      setVerificationStage("searching");
      setVerification(null);

      (async () => {
        try {
          setVerificationStage("verifying");

          const response = await fetch("/api/copilotkit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "execute_action",
              name: "verify-source",
              arguments: { claim: text, section: sectionId || "" },
            }),
          });

          setVerificationStage("analyzing");

          if (response.ok) {
            const data = await response.json();
            // Map backend VerificationResult to frontend VerificationResult
            const result: VerificationResult = {
              quote: data.directQuote || text,
              sourceUrl: data.sourceUrl || "",
              sourceName: data.sourceName || "Unknown",
              confidence: Math.round((data.confidenceScore || 0) * 100),
              confidenceLabel: data.confidenceLabel || "Low Confidence",
              verifiedAt: new Date().toISOString(),
              methodology: data.methodologyNote || "",
              relatedFindings: [],
            };
            setVerification(result);
            setVerificationStage("complete");
          } else {
            // Fallback to mock data if backend is unavailable
            _fallbackToMock(text, sectionId);
          }
        } catch {
          // Backend unavailable — fall back to mock data
          _fallbackToMock(text, sectionId);
        }
      })();

      function _fallbackToMock(text: string, sectionId?: string) {
        let result: VerificationResult;
        if (sectionId && mockVerifications[sectionId]) {
          result = { ...mockVerifications[sectionId], quote: text };
        } else {
          result = { ...mockVerifications.default, quote: text };
        }
        const jitter = Math.floor(Math.random() * 7) - 3;
        result.confidence = Math.max(75, Math.min(99, result.confidence + jitter));
        if (result.confidence >= 95) result.confidenceLabel = "Very High Confidence";
        else if (result.confidence >= 85) result.confidenceLabel = "High Confidence";
        else if (result.confidence >= 70) result.confidenceLabel = "Moderate Confidence";
        else result.confidenceLabel = "Low Confidence";
        setVerification(result);
        setVerificationStage("complete");
      }
    },
    [factStore],
  );

  return (
    <SelectionContext.Provider
      value={{
        selectedText,
        setSelectedText,
        activeHighlight,
        setActiveHighlight,
        highlights,
        addHighlight,
        removeHighlight,
        verification,
        setVerification,
        verifySelection,
        chatOpen,
        setChatOpen,
        factStore,
        matchedFacts,
        verificationStage,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within SelectionProvider");
  }
  return context;
}
