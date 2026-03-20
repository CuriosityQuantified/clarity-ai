"use client";

import React from "react";
import { useSelection } from "@/context/SelectionContext";
import { X } from "lucide-react";
import "@copilotkit/react-ui/styles.css";
import { CopilotChat } from "@copilotkit/react-ui";

export function ChatPanel() {
  const { chatOpen, setChatOpen } = useSelection();

  if (!chatOpen) return null;

  return (
    <div className="fixed inset-y-0 left-[250px] w-[400px] z-50 bg-[#12121a] border-r border-[#1e1e2e] shadow-2xl animate-slide-in-right flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e1e2e]">
        <div>
          <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
          <p className="text-[10px] text-[#71717a]">
            Ask questions about this document
          </p>
        </div>
        <button
          onClick={() => setChatOpen(false)}
          className="p-1.5 rounded-lg hover:bg-[#1e1e2e] text-[#71717a] hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden copilotKitChat">
        <CopilotChat
          className="h-full"
          labels={{
            title: "Research Assistant",
            initial: "Hi! I can help you analyze this research paper. Ask me about specific findings, methodology, or request source verification.",
            placeholder: "Ask about this paper...",
          }}
        />
      </div>
    </div>
  );
}
