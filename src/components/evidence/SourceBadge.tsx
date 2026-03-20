'use client';

interface SourceBadgeProps {
  url: string;
  domain: string;
  verified?: boolean;
}

export function SourceBadge({ url, domain, verified = false }: SourceBadgeProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Source
      </h3>
      <div className="flex items-center gap-3 rounded-lg bg-[#22222e] p-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 truncate text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {domain}
        </a>
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
            Verified &#x2713;
          </span>
        )}
      </div>
    </div>
  );
}
