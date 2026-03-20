'use client';

import { SelectionProvider } from '@/context/SelectionContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { MainContent } from '@/components/layout/MainContent';

export default function Home() {
  return (
    <SelectionProvider>
      <AppLayout>
        <MainContent />
      </AppLayout>
    </SelectionProvider>
  );
}
