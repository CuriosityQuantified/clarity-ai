# Clarity AI

Research document reader with AI-powered inline source verification, confidence scoring, and an AI copilot assistant.

## Features

- **3-Panel Dark UI** — Sidebar navigation, document viewer, and evidence panel
- **Text Selection Verification** — Select any claim in the document to see source verification
- **Confidence Gauge** — SVG radial progress ring showing verification confidence score
- **Evidence Overview** — Direct quotes, source badges, and confidence scores
- **CopilotKit Chat** — AI assistant with document context and verify-source action
- **Responsive Design** — Collapsible sidebar on mobile, stacked layout on tablet

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- CopilotKit (@copilotkit/react-core, @copilotkit/react-ui, @copilotkit/runtime)
- Vitest + React Testing Library

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Run tests
npm test
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Architecture

```
src/
├── app/
│   ├── api/copilotkit/     # CopilotKit runtime API route
│   ├── layout.tsx          # Root layout with dark theme
│   ├── page.tsx            # Main page with providers
│   └── globals.css         # Global styles + animations
├── components/
│   ├── copilot/            # CopilotKit chat sidebar
│   ├── evidence/           # Evidence panel components
│   │   ├── ConfidenceGauge.tsx
│   │   ├── DirectQuote.tsx
│   │   ├── SourceBadge.tsx
│   │   └── EvidenceOverview.tsx
│   └── layout/             # App layout components
├── context/                # React contexts (SelectionContext)
├── hooks/                  # Custom hooks (useCopilotSelection)
├── types/                  # TypeScript type definitions
└── data/                   # Sample documents and mock data
```

## Development

Phase 1 (current): Frontend UI with mock verification data
Phase 2 (planned): LangGraph Python agent + real source verification via Tavily
Phase 3 (planned): Multi-document analysis, citation graphs, exports
