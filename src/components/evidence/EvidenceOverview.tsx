'use client';

import { SourceVerification } from '@/types/document';
import { ConfidenceGauge } from './ConfidenceGauge';
import { DirectQuote } from './DirectQuote';
import { SourceBadge } from './SourceBadge';

interface EvidenceOverviewProps {
  verification: SourceVerification | null;
}

export function EvidenceOverview({ verification }: EvidenceOverviewProps) {
  if (!verification) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-4xl opacity-30">&#128269;</div>
        <p className="text-sm text-gray-400">
          Select text in the document to verify sources and see evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="evidence-panel flex flex-col gap-6 p-4">
      <DirectQuote
        quote={verification.directQuote}
        source={verification.sourceDomain}
      />
      <SourceBadge
        url={verification.sourceUrl}
        domain={verification.sourceDomain}
        verified={verification.verified}
      />
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Confidence Score
        </h3>
        <div className="flex justify-center rounded-lg bg-[#22222e] p-4">
          <ConfidenceGauge score={verification.confidenceScore} />
        </div>
      </div>
    </div>
  );
}
