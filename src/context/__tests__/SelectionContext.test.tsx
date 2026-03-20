import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SelectionProvider, useSelection } from '../SelectionContext';

function TestConsumer() {
  const { selectedText, verification, isVerifying, setSelectedText, clearSelection } = useSelection();
  return (
    <div>
      <span data-testid="selected">{selectedText ?? 'none'}</span>
      <span data-testid="verifying">{isVerifying ? 'yes' : 'no'}</span>
      <span data-testid="verified">{verification ? 'yes' : 'no'}</span>
      <button onClick={() => setSelectedText('This is a test sentence that is long enough to trigger verification')}>
        select
      </button>
      <button onClick={() => setSelectedText('short')}>select-short</button>
      <button onClick={clearSelection}>clear</button>
    </div>
  );
}

describe('SelectionContext', () => {
  it('starts with no selection', () => {
    render(
      <SelectionProvider>
        <TestConsumer />
      </SelectionProvider>
    );
    expect(screen.getByTestId('selected')).toHaveTextContent('none');
    expect(screen.getByTestId('verifying')).toHaveTextContent('no');
    expect(screen.getByTestId('verified')).toHaveTextContent('no');
  });

  it('sets selected text and triggers verification', async () => {
    vi.useFakeTimers();
    render(
      <SelectionProvider>
        <TestConsumer />
      </SelectionProvider>
    );

    await act(async () => {
      screen.getByText('select').click();
    });

    expect(screen.getByTestId('selected')).toHaveTextContent('This is a test sentence');
    expect(screen.getByTestId('verifying')).toHaveTextContent('yes');

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('verifying')).toHaveTextContent('no');
    expect(screen.getByTestId('verified')).toHaveTextContent('yes');
    vi.useRealTimers();
  });

  it('ignores short selections', async () => {
    render(
      <SelectionProvider>
        <TestConsumer />
      </SelectionProvider>
    );

    await act(async () => {
      screen.getByText('select-short').click();
    });

    expect(screen.getByTestId('selected')).toHaveTextContent('none');
  });

  it('clears selection', async () => {
    vi.useFakeTimers();
    render(
      <SelectionProvider>
        <TestConsumer />
      </SelectionProvider>
    );

    await act(async () => {
      screen.getByText('select').click();
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('verified')).toHaveTextContent('yes');

    await act(async () => {
      screen.getByText('clear').click();
    });

    expect(screen.getByTestId('selected')).toHaveTextContent('none');
    expect(screen.getByTestId('verified')).toHaveTextContent('no');
    vi.useRealTimers();
  });

  it('throws when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useSelection must be used within a SelectionProvider');
    consoleSpy.mockRestore();
  });
});
