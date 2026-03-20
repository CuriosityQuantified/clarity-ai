'use client';

import { useCopilotReadable } from '@copilotkit/react-core';
import { useSelection } from '@/context/SelectionContext';

export function useCopilotSelection() {
  const { selectedText, verification } = useSelection();

  useCopilotReadable({
    description: 'The text currently selected by the user in the document',
    value: selectedText ?? 'No text selected',
  });

  useCopilotReadable({
    description: 'The source verification result for the selected text',
    value: verification
      ? {
          directQuote: verification.directQuote,
          source: verification.sourceUrl,
          confidenceScore: verification.confidenceScore,
          verified: verification.verified,
        }
      : 'No verification available',
  });

  return { selectedText, verification };
}
