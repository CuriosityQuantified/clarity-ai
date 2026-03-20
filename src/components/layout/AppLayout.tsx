'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { EvidencePanel } from './EvidencePanel';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout grid h-screen grid-cols-[250px_1fr_350px]">
      <Sidebar />
      {children}
      <EvidencePanel />
    </div>
  );
}
