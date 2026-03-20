"use client";

import { SelectionProvider } from "@/context/SelectionContext";
import { CopilotProvider } from "@/components/CopilotProvider";
import { Sidebar } from "@/components/Sidebar";
import { DocumentViewer } from "@/components/DocumentViewer";
import { EvidencePanel } from "@/components/EvidencePanel";
import { ChatPanel } from "@/components/ChatPanel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useSelection } from "@/context/SelectionContext";

function KeyboardShortcuts() {
  const { setChatOpen, chatOpen } = useSelection();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setChatOpen(!chatOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatOpen, setChatOpen]);

  return null;
}

function AppContent() {
  return (
    <>
      <KeyboardShortcuts />
      <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
        <Sidebar />
        <DocumentViewer />
        <EvidencePanel />
        <ChatPanel />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <SelectionProvider>
      <CopilotProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </CopilotProvider>
    </SelectionProvider>
  );
}
