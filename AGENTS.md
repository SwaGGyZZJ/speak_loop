# AGENTS.md

SpeakLoop — mobile-first PWA for workplace English speaking practice. Next.js 15 App Router, React 19, TypeScript strict mode, no UI framework (plain CSS in `app/globals.css`).

## Commands

```bash
npm run dev          # dev server on 0.0.0.0:3000 (override with -- --port 5174)
npm run build        # production build
npm run start        # production server on 0.0.0.0:3000
npm run lint         # next lint (no typecheck script; tsc runs via next build)
```

No test framework is configured. Verify changes with `npm run build` (includes type-checking).

## Architecture

- **Single-page app**: `app/page.tsx` (~1500 lines) is the entire client UI — login, profile, scenario selection, expressions, practice, assessment, history. State machine driven by `Step` type.
- **API routes** (Next.js Route Handlers, JSON in/out):
  - `app/api/coach/route.ts` — DeepSeek LLM proxy for dialogue turns and post-practice assessment. Returns hardcoded fallbacks when `DEEPSEEK_API_KEY` is absent or the API errors.
  - `app/api/account-memory/route.ts` — account, profile, session history, and user memory. Dual-mode: Supabase REST when env vars present, otherwise local JSON file at `data/account-memory-db.json`.
- **Supabase migration**: `supabase/migrations/001_account_memory_p1.sql` defines the cloud schema. The app talks to Supabase via REST (PostgREST), not the JS SDK — no `@supabase/supabase-js` dependency.
- **PWA**: `app/manifest.ts` exports the web manifest. No service worker.

## Environment Variables

Defined in `.env.example`. Copy to `.env.local` for dev.

- `DEEPSEEK_API_KEY` — enables real LLM dialogue/assessment. Without it, both API routes return hardcoded fallbacks.
- `DEEPSEEK_MODEL` — defaults to `deepseek-chat`.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — all three required to switch account-memory from local JSON to Supabase. Any missing → local mock mode.

Never commit `.env.local`. It is gitignored.

## Storage Modes

The app has two storage modes that switch automatically based on env vars:

1. **Local mock** (default): `data/account-memory-db.json` — a flat JSON file with accounts, sessions, profiles, histories, memories. This file is gitignored. The route handler reads/writes it directly with `fs/promises`.
2. **Supabase cloud**: activated when all three Supabase env vars are set. Uses PostgREST endpoints directly via `fetch`. The `_lib` directory under `account-memory` is currently empty — all logic lives in `route.ts`.

Both modes expose the same action set: `login`, `getState`, `saveProfile`, `saveSession`, `deleteSession`, `deleteHistory`, `clearMemory`, `deleteAccount`.

## Conventions

- **No component extraction**: the entire UI lives in `app/page.tsx`. Icons from `lucide-react`. When adding features, follow the existing pattern of inline components in this file unless explicitly told otherwise.
- **JSON-only API**: both API routes expect and return JSON. The coach route asks DeepSeek for `response_format: { type: "json_object" }`.
- **Sensitive data filtering**: `account-memory/route.ts` has a `sensitivePatterns` regex array that strips password/ID/salary/address fields from stored memory. Preserve this when modifying memory logic.
- **`lang="zh-CN"`**: the root layout sets Chinese language. UI text is bilingual (English labels with Chinese instructional text).
- **No backend besides Next.js**: there is no separate server or database process. The local JSON file is the only persistent store in mock mode.

## Deployment

- **Vercel**: `vercel.json` sets framework to `nextjs` with `npm run build`. Supabase env vars must be set in Vercel project settings for cloud mode.
- **Docker**: `Dockerfile` uses `node:22-alpine`, builds with `npm ci`, passes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as build args. Runs on port 3000.

## Key Docs in Repo

- `ACCOUNT_MEMORY_SYSTEM_PLAN.md` — full design spec for the account + memory system (P0/P1 scope).
- `ACCOUNT_MEMORY_P1_SUPABASE.md` — Supabase schema and migration notes.
- `DOMESTIC_COMMERCIALIZATION_PLAN.md` — China market plan (WeChat, compliance).
- `DEPLOYMENT.md` — local and cloud deployment instructions.
- `SCORING_RUBRICS.md` — assessment rubric details.
