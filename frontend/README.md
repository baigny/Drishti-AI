# Drishti AI — Frontend

Next.js 16 (App Router) frontend for Drishti AI. See the [repo root README](../README.md) for full project/architecture docs.

## Prerequisites

- Node.js 20.9+
- The [backend](../backend) running (defaults to `http://localhost:7860`)

## Setup

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if backend isn't on localhost:7860
```

## Run

```bash
npm run dev      # dev server, http://localhost:3000
npm run build    # production build
npm run start    # serve production build
```

## Test & Lint

```bash
npm run lint      # ESLint
npm run test:e2e  # Playwright — mocked backend, fake camera/mic device
```
