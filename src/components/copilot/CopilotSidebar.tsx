'use client';

import { CopilotPopup } from '@copilotkit/react-ui';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { useSelection } from '@/context/SelectionContext';
import { sampleDocument } from '@/data/sample-documents';
import { mockVerification } from '@/data/sample-documents';
import '@copilotkit/react-ui/styles.css';

export function CopilotSidebar() {
  const { selectedText, verification } = useSelection();

  useCopilotReadable({
    description: 'The research document currently being viewed',
    value: {
      title: sampleDocument.title,
      authors: sampleDocument.authors,
      content: sampleDocument.paragraphs.map((p) => p.text).join('\n\n'),
    },
  });

  useCopilotReadable({
    description: 'Currently selected text in the document',
    value: selectedText ?? 'No text currently selected',
  });

  useCopilotReadable({
    description: 'Source verification results for the selected text',
    value: verification ?? 'No verification data available',
  });

  useCopilotAction({
    name: 'verify-source',
    description: 'Verify the source of a claim or statement in the document. Returns confidence score and source information.',
    parameters: [
      {
        name: 'claim',
        type: 'string',
        description: 'The claim or statement to verify',
        required: true,
      },
    ],
    handler: async ({ claim }) => {
      // Mock verification for Phase 1
      return {
        claim,
        verified: true,
        confidenceScore: mockVerification.confidenceScore,
        source: mockVerification.sourceUrl,
        directQuote: mockVerification.directQuote,
        explanation: `The claim "${claim.substring(0, 50)}..." was found to be supported by peer-reviewed research with a ${mockVerification.confidenceScore}% confidence score.`,
      };
    },
  });

  return (
    <CopilotPopup
      labels={{
        title: 'Clarity AI Assistant',
        initial: 'Hi! I can help you analyze this research document. Try selecting text to verify sources, or ask me about the document content.',
      }}
      className="copilot-popup"
    />
  );
}
