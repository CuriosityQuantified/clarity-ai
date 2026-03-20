'use client';

import { useSelection } from '@/context/SelectionContext';
import { EvidenceOverview } from '@/components/evidence/EvidenceOverview';

export function EvidencePanel() {
  const { verification, isVerifying } = useSelection();

  return (
    <aside className="evidence-panel flex flex-col bg-[#1a1a24] border-l border-white/5 overflow-y-auto">
      <div className="border-b border-white/5 px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Evidence Overview
        </h2>
      </div>

      {isVerifying ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Verifying source...</p>
        </div>
      ) : (
        <EvidenceOverview verification={verification} />
      )}
    </aside>
  );
}
