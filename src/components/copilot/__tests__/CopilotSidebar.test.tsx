import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock CopilotKit modules since they need runtime setup
vi.mock('@copilotkit/react-ui', () => ({
  CopilotPopup: ({ labels }: { labels: { title: string; initial: string } }) => (
    <div data-testid="copilot-popup">
      <span>{labels.title}</span>
      <span>{labels.initial}</span>
    </div>
  ),
}));

vi.mock('@copilotkit/react-core', () => ({
  useCopilotReadable: vi.fn(),
  useCopilotAction: vi.fn(),
}));

vi.mock('@/context/SelectionContext', () => ({
  useSelection: () => ({
    selectedText: null,
    verification: null,
    isVerifying: false,
    setSelectedText: vi.fn(),
    clearSelection: vi.fn(),
  }),
}));

import { CopilotSidebar } from '../CopilotSidebar';

describe('CopilotSidebar', () => {
  it('renders the CopilotPopup with correct title', () => {
    render(<CopilotSidebar />);
    expect(screen.getByText('Clarity AI Assistant')).toBeInTheDocument();
  });

  it('renders the initial message', () => {
    render(<CopilotSidebar />);
    expect(screen.getByText(/help you analyze/)).toBeInTheDocument();
  });

  it('renders the copilot popup element', () => {
    render(<CopilotSidebar />);
    expect(screen.getByTestId('copilot-popup')).toBeInTheDocument();
  });
});
