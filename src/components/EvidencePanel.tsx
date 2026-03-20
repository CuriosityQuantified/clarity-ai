"use client";

import React from "react";
import { useSelection } from "@/context/SelectionContext";
import {
  Shield,
  ExternalLink,
  Quote,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function ConfidenceGauge({ confidence }: { confidence: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  const getColor = (c: number) => {
    if (c >= 90) return { stroke: "url(#gaugeGradientHigh)", text: "text-emerald-400" };
    if (c >= 80) return { stroke: "url(#gaugeGradientMed)", text: "text-yellow-400" };
    return { stroke: "url(#gaugeGradientLow)", text: "text-orange-400" };
  };

  const colors = getColor(confidence);

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
        <defs>
          <linearGradient id="gaugeGradientHigh" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="gaugeGradientMed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="gaugeGradientLow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="8"
        />
        {/* Value ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            animation: "gauge-fill 1s ease-out",
            transition: "stroke-dashoffset 0.8s ease-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${colors.text}`}>{confidence}%</span>
      </div>
    </div>
  );
}

export function EvidencePanel() {
  const { verification, highlights, activeHighlight, removeHighlight, setActiveHighlight, verifySelection } =
    useSelection();

  return (
    <aside className="w-[350px] min-w-[350px] h-screen bg-[#0d0d14] border-l border-[#1e1e2e] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Evidence Panel</h2>
        </div>
        <p className="text-[10px] text-[#71717a] mt-1">
          Source verification and confidence analysis
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!verification && highlights.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#12121a] border border-[#1e1e2e] flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-[#2a2a3a]" />
            </div>
            <p className="text-sm text-[#71717a] mb-1">No selection yet</p>
            <p className="text-xs text-[#52525b]">
              Select text in the document to verify sources and view evidence
            </p>
          </div>
        )}

        {verification && (
          <div className="space-y-4 animate-slide-in-right">
            {/* Confidence gauge */}
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative">
                  <ConfidenceGauge confidence={verification.confidence} />
                </div>
                <p
                  className={`text-xs font-medium mt-3 ${
                    verification.confidence >= 90
                      ? "text-emerald-400"
                      : verification.confidence >= 80
                        ? "text-yellow-400"
                        : "text-orange-400"
                  }`}
                >
                  {verification.confidenceLabel}
                </p>
                <p className="text-[10px] text-[#71717a] mt-1">
                  Verified {new Date(verification.verifiedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            {/* Direct quote */}
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
                  <Quote className="w-3 h-3" />
                  Selected Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-xs text-[#b4b4be] leading-relaxed border-l-2 border-indigo-500/50 pl-3 italic">
                  &ldquo;{verification.quote.length > 200
                    ? verification.quote.slice(0, 200) + "..."
                    : verification.quote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>

            {/* Source */}
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white font-medium">
                      {verification.sourceName}
                    </p>
                    <a
                      href={verification.sourceUrl}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-mono break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {verification.sourceUrl}
                    </a>
                    <Badge
                      variant="outline"
                      className="mt-2 border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-[9px]"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                      Verified Source
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Methodology */}
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3" />
                  Methodology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[#b4b4be] leading-relaxed">
                  {verification.methodology}
                </p>
              </CardContent>
            </Card>

            {/* Related findings */}
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3" />
                  Related Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {verification.relatedFindings.map((finding, i) => (
                    <li
                      key={i}
                      className="text-xs text-[#b4b4be] leading-relaxed flex items-start gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Highlights list */}
        {highlights.length > 0 && (
          <>
            <Separator className="bg-[#1e1e2e]" />
            <div>
              <p className="text-[10px] font-medium text-[#71717a] uppercase tracking-widest mb-2">
                All Highlights ({highlights.length})
              </p>
              <div className="space-y-1.5">
                {highlights.map((hl) => (
                  <div
                    key={hl.id}
                    className={`group flex items-start gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeHighlight?.id === hl.id
                        ? "bg-indigo-500/10 border border-indigo-500/20"
                        : "hover:bg-[#12121a] border border-transparent"
                    }`}
                    onClick={() => {
                      setActiveHighlight(hl);
                      verifySelection(hl.text, hl.sectionId);
                    }}
                  >
                    <div className="w-1 h-full min-h-[20px] rounded-full bg-indigo-500/40 flex-shrink-0" />
                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed line-clamp-2 flex-1">
                      {hl.text}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHighlight(hl.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-400 text-[#71717a]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
