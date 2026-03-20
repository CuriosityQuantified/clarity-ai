'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { EvidencePanel } from './EvidencePanel';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout grid h-screen grid-cols-1 md:grid-cols-[1fr_350px] lg:grid-cols-[250px_1fr_350px]">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-[#1a1a24] p-2 text-gray-400 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" />
        </svg>
      </button>

      {/* Sidebar: hidden on mobile, shown on lg+ */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-[250px] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {children}
      <EvidencePanel />
    </div>
  );
}
