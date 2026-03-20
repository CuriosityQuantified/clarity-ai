'use client';

interface DirectQuoteProps {
  quote: string;
  source: string;
}

export function DirectQuote({ quote, source }: DirectQuoteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Direct Quote
      </h3>
      <div className="relative rounded-lg bg-[#22222e] p-4">
        <span className="absolute -top-2 left-3 text-3xl text-indigo-400 leading-none">
          {'\u201C'}
        </span>
        <blockquote className="pl-4 text-sm leading-relaxed text-gray-300 italic">
          {quote}
        </blockquote>
        <p className="mt-2 pl-4 text-xs text-gray-500">{source}</p>
      </div>
    </div>
  );
}
