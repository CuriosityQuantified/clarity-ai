"use client";

import React from "react";
import { documentList } from "@/lib/mock-data";
import { useSelection } from "@/context/SelectionContext";
import {
  FileText,
  Search,
  MessageSquare,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const { setChatOpen, chatOpen } = useSelection();

  return (
    <aside className="w-[250px] min-w-[250px] h-screen bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col">
      {/* Logo area */}
      <div className="p-4 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">
              Clarity AI
            </h1>
            <p className="text-[10px] text-[#71717a] uppercase tracking-widest">
              Research Reader
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12121a] border border-[#1e1e2e] text-[#71717a] text-sm">
          <Search className="w-3.5 h-3.5" />
          <span>Search documents...</span>
        </div>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-2 py-2">
          <span className="text-[10px] font-medium text-[#71717a] uppercase tracking-widest">
            Documents
          </span>
        </div>
        {documentList.map((doc) => (
          <button
            key={doc.id}
            className={`w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-200 group ${
              doc.active
                ? "bg-[#1e1e2e] border border-indigo-500/20"
                : "hover:bg-[#12121a] border border-transparent"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <FileText
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  doc.active ? "text-indigo-400" : "text-[#71717a]"
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    doc.active ? "text-white" : "text-[#a1a1aa]"
                  }`}
                >
                  {doc.title}
                </p>
                <p className="text-[10px] text-[#71717a] mt-0.5">
                  {doc.authors[0]} {doc.authors.length > 1 ? "et al." : ""} &middot;{" "}
                  {doc.source}
                </p>
              </div>
              {doc.active && (
                <ChevronRight className="w-3 h-3 text-indigo-400 ml-auto mt-1 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-[#1e1e2e] p-2 space-y-0.5">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
            chatOpen
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "text-[#a1a1aa] hover:bg-[#12121a] border border-transparent"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Assistant</span>
          <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e2e] text-[#71717a] font-mono">
            ⌘K
          </kbd>
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#a1a1aa] hover:bg-[#12121a] transition-all duration-200">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
