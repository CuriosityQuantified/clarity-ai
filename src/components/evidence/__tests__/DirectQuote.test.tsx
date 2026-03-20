import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DirectQuote } from '../DirectQuote';

describe('DirectQuote', () => {
  const quoteText = 'AI diagnostic tools have achieved accuracy rates of up to 94%';
  const sourceText = 'Nature Medicine, 2024';

  it('renders a blockquote element', () => {
    const { container } = render(<DirectQuote quote={quoteText} source={sourceText} />);
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
  });

  it('displays the quote text', () => {
    render(<DirectQuote quote={quoteText} source={sourceText} />);
    expect(screen.getByText(quoteText)).toBeInTheDocument();
  });

  it('displays the source text', () => {
    render(<DirectQuote quote={quoteText} source={sourceText} />);
    expect(screen.getByText(sourceText)).toBeInTheDocument();
  });

  it('includes quotation mark decoration', () => {
    render(<DirectQuote quote={quoteText} source={sourceText} />);
    // Should have a visual quotation mark element
    expect(screen.getByText('\u201C')).toBeInTheDocument();
  });
});
