"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { mockDocument, mockVerifications } from "@/lib/mock-data";
import { useSelection } from "@/context/SelectionContext";

function CopilotDocumentContext() {
  const { highlights, selectedText } = useSelection();

  useCopilotReadable({
    description: "The current research document being viewed",
    value: {
      title: mockDocument.meta.title,
      authors: mockDocument.meta.authors,
      journal: mockDocument.meta.journal,
      abstract: mockDocument.sections[0]?.content,
      sectionHeadings: mockDocument.sections.map((s) => s.heading),
    },
  });

  useCopilotReadable({
    description: "Currently highlighted text selections in the document",
    value: highlights.map((h) => ({ text: h.text, section: h.sectionId })),
  });

  useCopilotReadable({
    description: "The most recently selected text",
    value: selectedText,
  });

  useCopilotAction({
    name: "verify-source",
    description:
      "Verify a claim or piece of text from the research document against its sources",
    parameters: [
      {
        name: "claim",
        type: "string",
        description: "The claim or text to verify",
        required: true,
      },
      {
        name: "section",
        type: "string",
        description: "Which section the claim is from",
        required: false,
      },
    ],
    handler: async ({ claim, section }) => {
      // Mock verification - returns a structured result
      const sectionKey = section || "default";
      const verification =
        mockVerifications[sectionKey] || mockVerifications.default;
      return {
        verified: true,
        confidence: verification.confidence,
        source: verification.sourceName,
        methodology: verification.methodology,
        quote: claim,
      };
    },
  });

  return null;
}

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false}>
      <CopilotDocumentContext />
      {children}
    </CopilotKit>
  );
}
