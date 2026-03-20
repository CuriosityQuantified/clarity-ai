'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { SelectionProvider } from '@/context/SelectionContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { MainContent } from '@/components/layout/MainContent';
import { CopilotSidebar } from '@/components/copilot/CopilotSidebar';

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <SelectionProvider>
        <AppLayout>
          <MainContent />
        </AppLayout>
        <CopilotSidebar />
      </SelectionProvider>
    </CopilotKit>
  );
}
