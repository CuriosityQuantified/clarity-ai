# Clarity AI: Research Document Reader — Design & Implementation Plan

> **For agent:** REQUIRED SUB-SKILL: Use Superpowers Section 4 or Section 5 to implement this plan.

**Goal:** Build "Clarity AI," a research document reader web app with CopilotKit generative UI, featuring inline source verification, confidence scoring, and an AI copilot — positioned as the Blue Team entry in the CopilotKit vs LangGraph debate.

**Architecture:** Next.js 14 (App Router) frontend with CopilotKit SDK for generative UI + shared agent state. Python FastAPI backend with LangGraph agent for research orchestration, connected via AG-UI protocol. Tailwind CSS + shadcn/ui for the dark-themed UI.

**Tech Stack:** Next.js 14, TypeScript, React, CopilotKit (@copilotkit/react-core, @copilotkit/react-ui), Tailwind CSS, shadcn/ui, LangGraph (Python), FastAPI, Tavily Search API, AG-UI Protocol

**Repo:** `CuriosityQuantified/clarity-ai`

---

## UI Specification (from reference image)

### Layout: 3-Panel Dark Theme

1. **Left Sidebar** (~250px, collapsible)
   - App title: "Clarity AI" with brain/sparkle icon
   - Navigation: Document Library, Research Sessions, Bookmarks, Settings
   - Active state: highlighted item with accent color
   - Bottom: User avatar + settings gear

2. **Main Content Area** (center, flex-grow)
   - Header: Document title ("AI Adoption in Healthcare: Trends, Challenges, and Future Outlook")
   - Subtitle: metadata (authors, date, source)
   - Body: Rendered document text with selectable passages
   - **Inline Highlight Interaction:** User selects/highlights a passage → tooltip appears: "Source Verified ✓" badge with green checkmark
   - Selected text gets a colored highlight overlay (blue/purple accent)
   - The highlighted passage in the image: text about "AI diagnostic tools" being verified

3. **Right Panel — Evidence Overview** (~350px)
   - Panel header: "Evidence Overview"
   - **Direct Quote** section: blockquote showing the exact verified source text
   - **Source** section: URL with domain, clickable, with a "Verified ✓" green badge
   - **Confidence Score** section:
     - Large circular gauge (radial progress indicator), green fill
     - Score: "94%" in large text center of gauge
     - Label: "High Confidence" below
     - Gauge uses green gradient fill proportional to score

### Color Palette (Dark Theme)
- Background: ~#0f0f14 (very dark blue-black)
- Panel backgrounds: ~#1a1a24 (slightly lighter)
- Card/section backgrounds: ~#22222e
- Primary accent: blue-purple (#6366f1 / indigo-500)
- Success/verified: green (#22c55e / green-500)
- Text primary: white/near-white
- Text secondary: gray-400
- Highlight overlay: semi-transparent indigo

### Typography
- App title: Bold, ~18px
- Document title: Bold, ~24px
- Body text: Regular, ~16px, good line height (~1.7)
- Panel labels: Semi-bold, ~14px, uppercase tracking
- Confidence score: Bold, ~36px

---

## Phase 1: Project Scaffolding & Core UI Shell

### Task 1: Initialize Next.js Project with CopilotKit

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1:** Initialize Next.js 14 project with TypeScript, Tailwind, App Router
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint
```

**Step 2:** Install CopilotKit packages
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
```

**Step 3:** Install shadcn/ui + dependencies
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge separator scroll-area tooltip
```

**Step 4:** Configure CopilotKit provider in `src/app/layout.tsx`

**Step 5:** Commit: `git add -A && git commit -m "feat: initialize Next.js project with CopilotKit and shadcn/ui"`

---

### Task 2: Build Dark Theme Layout Shell (3-Panel)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/MainContent.tsx`
- Create: `src/components/layout/EvidencePanel.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Step 1:** Write test: Render AppLayout, verify 3 panels present
**Step 2:** Run test, verify fails (components don't exist)
**Step 3:** Implement AppLayout with CSS Grid: `grid-cols-[250px_1fr_350px]`
**Step 4:** Implement Sidebar with nav items (Document Library, Research Sessions, Bookmarks, Settings)
**Step 5:** Implement MainContent placeholder with document title area
**Step 6:** Implement EvidencePanel placeholder with "Evidence Overview" header
**Step 7:** Apply dark theme colors from spec
**Step 8:** Run test, verify passes
**Step 9:** Commit: `feat: build 3-panel dark theme layout shell`

---

### Task 3: Build Document Viewer Component

**Files:**
- Create: `src/components/document/DocumentViewer.tsx`
- Create: `src/components/document/DocumentHeader.tsx`
- Create: `src/components/document/TextBlock.tsx`
- Create: `src/types/document.ts`
- Create: `src/data/sample-documents.ts` (mock data)

**Step 1:** Define TypeScript types: `Document`, `Paragraph`, `SourceVerification`
**Step 2:** Write test: DocumentViewer renders title, subtitle, and body paragraphs
**Step 3:** Run test, verify fails
**Step 4:** Create sample document data (the healthcare AI paper from the image)
**Step 5:** Implement DocumentHeader (title, authors, date, source metadata)
**Step 6:** Implement TextBlock (renders paragraphs with proper typography)
**Step 7:** Implement DocumentViewer composing header + text blocks with scroll
**Step 8:** Run test, verify passes
**Step 9:** Commit: `feat: document viewer with header and text blocks`

---

### Task 4: Build Text Selection & Highlight System

**Files:**
- Create: `src/hooks/useTextSelection.ts`
- Create: `src/components/document/HighlightOverlay.tsx`
- Create: `src/components/document/VerificationTooltip.tsx`
- Modify: `src/components/document/TextBlock.tsx`

**Step 1:** Write test: selecting text triggers highlight state with selected text + position
**Step 2:** Run test, verify fails
**Step 3:** Implement `useTextSelection` hook (captures Selection API, extracts text + bounding rect)
**Step 4:** Implement HighlightOverlay (semi-transparent indigo overlay on selected text)
**Step 5:** Write test: VerificationTooltip shows "Source Verified ✓" badge
**Step 6:** Run test, verify fails
**Step 7:** Implement VerificationTooltip (positioned near selection, green checkmark badge)
**Step 8:** Integrate into TextBlock — on text select, show highlight + tooltip
**Step 9:** Run tests, verify pass
**Step 10:** Commit: `feat: text selection with highlight overlay and verification tooltip`

---

### Task 5: Build Evidence Panel Components

**Files:**
- Create: `src/components/evidence/EvidenceOverview.tsx`
- Create: `src/components/evidence/DirectQuote.tsx`
- Create: `src/components/evidence/SourceBadge.tsx`
- Create: `src/components/evidence/ConfidenceGauge.tsx`
- Modify: `src/components/layout/EvidencePanel.tsx`

**Step 1:** Write test: ConfidenceGauge renders SVG circle with correct percentage fill and label
**Step 2:** Run test, verify fails
**Step 3:** Implement ConfidenceGauge — radial SVG progress ring, green gradient, percentage text center, "High/Medium/Low Confidence" label based on thresholds (>80 High, >50 Medium, else Low)
**Step 4:** Write test: DirectQuote renders blockquote with source text
**Step 5:** Run test, verify fails
**Step 6:** Implement DirectQuote — styled blockquote with quotation marks and source text
**Step 7:** Implement SourceBadge — URL display with domain, clickable, green "Verified ✓" badge
**Step 8:** Implement EvidenceOverview — composes DirectQuote + SourceBadge + ConfidenceGauge
**Step 9:** Run all tests, verify pass
**Step 10:** Commit: `feat: evidence panel with confidence gauge, source badge, and direct quote`

---

### Task 6: Wire Up Selection → Evidence Panel (Shared State)

**Files:**
- Create: `src/context/SelectionContext.tsx`
- Create: `src/hooks/useCopilotSelection.ts`
- Modify: `src/components/document/TextBlock.tsx`
- Modify: `src/components/layout/EvidencePanel.tsx`
- Modify: `src/app/page.tsx`

**Step 1:** Write test: selecting text in document updates Evidence Panel with mock verification data
**Step 2:** Run test, verify fails
**Step 3:** Create SelectionContext (React context for selected text + verification state)
**Step 4:** Implement useCopilotSelection hook — uses CopilotKit `useCopilotReadable` to share selection state with AI + provides verification trigger
**Step 5:** Wire TextBlock selection → context update → EvidencePanel re-render
**Step 6:** For Phase 1: use mock verification data (hardcoded confidence scores). Real AI verification comes in Phase 2.
**Step 7:** Run tests, verify pass
**Step 8:** Commit: `feat: wire selection to evidence panel via shared state`

---

### Task 7: CopilotKit Chat Sidebar Integration

**Files:**
- Create: `src/components/copilot/CopilotSidebar.tsx`
- Create: `src/app/api/copilotkit/route.ts` (CopilotKit runtime API route)
- Modify: `src/app/layout.tsx`

**Step 1:** Write test: CopilotKit chat panel renders and accepts messages
**Step 2:** Run test, verify fails
**Step 3:** Create CopilotKit API route (`/api/copilotkit`) with CopilotRuntime
**Step 4:** Implement CopilotSidebar using `@copilotkit/react-ui` CopilotPopup or CopilotSidebar component
**Step 5:** Configure with `useCopilotReadable` for document content and selection state
**Step 6:** Add `useCopilotAction` for "verify-source" action (mock for now)
**Step 7:** Run tests, verify pass
**Step 8:** Commit: `feat: CopilotKit chat integration with document-aware context`

---

### Task 8: Polish, Responsive Design, Initial Push

**Files:**
- Modify: multiple component files for responsive behavior
- Create: `README.md`
- Create: `.env.example`

**Step 1:** Add responsive breakpoints: collapse sidebar on mobile, stack evidence panel below
**Step 2:** Add loading states and empty states (no document selected, no verification yet)
**Step 3:** Add subtle animations: highlight fade-in, evidence panel slide-in, gauge fill animation
**Step 4:** Write README with project overview, setup instructions, architecture diagram
**Step 5:** Run all tests, verify pass
**Step 6:** Push to GitHub
```bash
git remote add origin https://github.com/CuriosityQuantified/clarity-ai.git
git push -u origin main
```
**Step 7:** Commit: `feat: polish, responsive design, and documentation`

---

## Phase 2: AI Backend & Real Verification (Future)

- LangGraph Python agent for source verification
- Tavily search integration for real-time source finding
- AG-UI protocol connection to CopilotKit frontend
- Real confidence scoring algorithm
- Document upload/parsing (PDF, web URLs)

## Phase 3: Advanced Features (Future)

- Multi-document analysis
- Citation graph visualization
- Export to Markdown/PDF with annotations
- Collaborative sessions
- Research session persistence

---

## Development Approach

- **Methodology:** Superpowers (brainstorm → plan → TDD → review)
- **TDD:** Every component gets tests first (RED → GREEN → REFACTOR)
- **Git:** Feature branches per task, commits after each task, push regularly
- **Swarm execution:** Subagent per task with spec review + code quality review between tasks
- **Blue Team positioning:** This demonstrates CopilotKit's generative UI + shared state as the frontend framework, with OpenClaw/Claude Code as the development backbone — showing that CopilotKit provides a cleaner, more composable approach to AI-native UIs than building everything from scratch with LangGraph alone.

---

## Estimated Effort

- Phase 1 (8 tasks): ~2-3 hours of agent swarm time
- Phase 2: ~3-4 hours
- Phase 3: TBD

