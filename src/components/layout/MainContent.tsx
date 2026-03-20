'use client';

import { useSelection } from '@/context/SelectionContext';
import { sampleDocument } from '@/data/sample-documents';

export function MainContent() {
  const { setSelectedText } = useSelection();

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length >= 10) {
      setSelectedText(text);
    }
  };

  return (
    <main className="main-content flex-1 overflow-y-auto bg-[#0f0f14] p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {sampleDocument.title}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {sampleDocument.authors.join(', ')} &middot; {sampleDocument.date} &middot; {sampleDocument.source}
          </p>
          <p className="mt-1 text-sm text-gray-500">{sampleDocument.subtitle}</p>
        </header>

        <article className="space-y-5" onMouseUp={handleMouseUp}>
          {sampleDocument.paragraphs.map((para) => (
            <p
              key={para.id}
              className="text-base leading-[1.7] text-gray-300 selection:bg-indigo-500/30"
            >
              {para.text}
            </p>
          ))}
        </article>
      </div>
    </main>
  );
}
