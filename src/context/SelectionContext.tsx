"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { VerificationResult, mockVerifications } from "@/lib/mock-data";

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
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedText, setSelectedText] = useState("");
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

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
      }
    },
    [activeHighlight],
  );

  const verifySelection = useCallback((text: string, sectionId?: string) => {
    // Find the best matching mock verification based on section
    let result: VerificationResult;
    if (sectionId && mockVerifications[sectionId]) {
      result = { ...mockVerifications[sectionId], quote: text };
    } else {
      result = { ...mockVerifications.default, quote: text };
    }
    // Slightly randomize confidence for realism
    const jitter = Math.floor(Math.random() * 7) - 3;
    result.confidence = Math.max(75, Math.min(99, result.confidence + jitter));
    if (result.confidence >= 95) result.confidenceLabel = "Very High Confidence";
    else if (result.confidence >= 85) result.confidenceLabel = "High Confidence";
    else if (result.confidence >= 70) result.confidenceLabel = "Moderate Confidence";
    else result.confidenceLabel = "Low Confidence";

    setVerification(result);
  }, []);

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
