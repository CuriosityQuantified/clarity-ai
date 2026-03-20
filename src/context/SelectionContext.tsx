'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SourceVerification } from '@/types/document';
import { mockVerification } from '@/data/sample-documents';

interface SelectionState {
  selectedText: string | null;
  verification: SourceVerification | null;
  isVerifying: boolean;
}

interface SelectionContextValue extends SelectionState {
  setSelectedText: (text: string | null) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SelectionState>({
    selectedText: null,
    verification: null,
    isVerifying: false,
  });

  const setSelectedText = useCallback((text: string | null) => {
    if (!text || text.trim().length < 10) {
      setState({ selectedText: null, verification: null, isVerifying: false });
      return;
    }

    setState({ selectedText: text, verification: null, isVerifying: true });

    // Mock verification — simulate async delay then return mock data
    setTimeout(() => {
      setState({
        selectedText: text,
        verification: {
          ...mockVerification,
          selectedText: text,
        },
        isVerifying: false,
      });
    }, 800);
  }, []);

  const clearSelection = useCallback(() => {
    setState({ selectedText: null, verification: null, isVerifying: false });
  }, []);

  return (
    <SelectionContext.Provider value={{ ...state, setSelectedText, clearSelection }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return ctx;
}
