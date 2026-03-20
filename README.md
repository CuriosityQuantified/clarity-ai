# Clarity AI

AI-powered research document reader with source verification and evidence analysis.

## Overview

Clarity AI is a polished dark-themed research document reader that enables users to verify claims in academic papers. Built with CopilotKit for generative UI, it provides real-time source verification, confidence scoring, and an AI assistant for document analysis.

## Features

- **Three-Panel Layout** — Left sidebar for navigation, center document viewer, right evidence panel
- **Text Selection & Highlighting** — Select any text in a document to verify its source
- **Evidence Panel** — Shows verification details including confidence gauge, source citations, methodology, and related findings
- **AI Chat Assistant** — CopilotKit-powered chat that's aware of the current document context
- **Dark Theme** — Polished dark UI designed for extended reading sessions

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- CopilotKit SDK (@copilotkit/react-core, @copilotkit/react-ui, @copilotkit/runtime)
- Tailwind CSS + shadcn/ui
- Lucide Icons

## Getting Started

```bash
npm install
npm run dev
```

The app runs on [http://localhost:3104](http://localhost:3104).

## Project Structure

```
src/
  app/
    api/copilotkit/    # CopilotKit runtime endpoint
    layout.tsx         # Root layout with dark theme
    page.tsx           # Main page composing all panels
    globals.css        # Dark theme CSS variables and custom styles
  components/
    Sidebar.tsx        # Left navigation panel
    DocumentViewer.tsx # Center document viewer with text selection
    EvidencePanel.tsx  # Right panel with verification details
    ChatPanel.tsx      # CopilotKit chat overlay
    CopilotProvider.tsx # CopilotKit context and actions
    ui/                # shadcn/ui components
  context/
    SelectionContext.tsx # Shared state for text selection and verification
  lib/
    mock-data.ts       # Sample research paper and verification data
```

## Phase 1 Status

This is Phase 1 (Core UI Shell) with mock verification data. Phase 2 will add real AI-powered source verification.
