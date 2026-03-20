"use client";

import React, { useCallback, useRef } from "react";
import { mockDocument } from "@/lib/mock-data";
import { useSelection } from "@/context/SelectionContext";
import { Calendar, User, BookOpen, Clock, ExternalLink, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function HighlightedContent({
  content,
  sectionId,
}: {
  content: string;
  sectionId: string;
}) {
  const { highlights, activeHighlight, setActiveHighlight, verifySelection } =
    useSelection();

  const sectionHighlights = highlights.filter((h) => h.sectionId === sectionId);

  if (sectionHighlights.length === 0) {
    return <>{content}</>;
  }

  // Sort highlights by start offset
  const sorted = [...sectionHighlights].sort(
    (a, b) => a.startOffset - b.startOffset,
  );
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  sorted.forEach((hl) => {
    if (hl.startOffset > lastIndex) {
      parts.push(content.slice(lastIndex, hl.startOffset));
    }
    const isActive = activeHighlight?.id === hl.id;
    parts.push(
      <span
        key={hl.id}
        className={`highlight-selection relative cursor-pointer ${
          isActive ? "ring-1 ring-indigo-400/50" : ""
        }`}
        onClick={() => {
          setActiveHighlight(hl);
          verifySelection(hl.text, sectionId);
        }}
        title="Source Verified ✓"
      >
        {hl.text}
        {isActive && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-medium whitespace-nowrap z-10 animate-fade-in flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" />
            Source Verified
          </span>
        )}
      </span>,
    );
    lastIndex = hl.endOffset;
  });

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts}</>;
}

export function DocumentViewer() {
  const { addHighlight, verifySelection, setSelectedText } = useSelection();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const text = selection.toString().trim();
    if (text.length < 10) return; // Require minimum selection length

    const range = selection.getRangeAt(0);

    // Find the section element
    let sectionEl = range.startContainer.parentElement;
    while (sectionEl && !sectionEl.dataset.sectionId) {
      sectionEl = sectionEl.parentElement;
    }
    if (!sectionEl) return;

    const sectionId = sectionEl.dataset.sectionId!;
    // Calculate offsets within the section text
    const fullText = sectionEl.textContent || "";
    const startOffset = fullText.indexOf(text);
    if (startOffset === -1) return;

    setSelectedText(text);
    addHighlight({
      text,
      sectionId,
      startOffset,
      endOffset: startOffset + text.length,
    });
    verifySelection(text, sectionId);

    // Clear selection
    selection.removeAllRanges();
  }, [addHighlight, verifySelection, setSelectedText]);

  const { meta, sections } = mockDocument;

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="outline"
              className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-[10px] uppercase tracking-wider"
            >
              Peer Reviewed
            </Badge>
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-[10px] uppercase tracking-wider"
            >
              Open Access
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-white leading-tight mb-4">
            {meta.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#71717a]">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {meta.authors.join(", ")}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(meta.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {meta.journal}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {meta.readingTime}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#71717a]">
            <ExternalLink className="w-3 h-3" />
            <a
              href={`https://doi.org/${meta.doi}`}
              className="hover:text-indigo-400 transition-colors font-mono text-[11px]"
              target="_blank"
              rel="noopener noreferrer"
            >
              DOI: {meta.doi}
            </a>
          </div>
        </div>

        <Separator className="bg-[#1e1e2e] mb-8" />

        {/* Instruction hint */}
        <div className="mb-6 px-4 py-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 animate-fade-in">
          <p className="text-xs text-indigo-300/70">
            <span className="font-medium text-indigo-300">Tip:</span> Select any
            text in the document to verify its source and see evidence details in the
            right panel.
          </p>
        </div>

        {/* Document body */}
        <div ref={contentRef} onMouseUp={handleMouseUp} className="space-y-8">
          {sections.map((section, i) => (
            <section
              key={section.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <h2 className="text-lg font-semibold text-white mb-3">
                {section.heading}
              </h2>
              <div
                data-section-id={section.id}
                className="text-sm text-[#b4b4be] leading-7 whitespace-pre-line selection:bg-indigo-500/30"
              >
                <HighlightedContent
                  content={section.content}
                  sectionId={section.id}
                />
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <Separator className="bg-[#1e1e2e] mt-12 mb-6" />
        <div className="text-xs text-[#71717a] pb-10">
          <p>
            &copy; 2025 Nature Medicine. This article is licensed under a Creative
            Commons Attribution 4.0 International License.
          </p>
          <p className="mt-1">
            Correspondence: Dr. Sarah Chen, Department of Health Informatics,
            Stanford University School of Medicine.
          </p>
        </div>
      </div>
    </div>
  );
}
