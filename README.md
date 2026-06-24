# SpeakLoop Workplace Speaking PWA MVP

Mobile Web/PWA prototype for workplace English speaking practice.

## Run

```bash
npm install
npm run dev -- --port 5174
```

Open:

```text
http://localhost:5174
```

## Scope

- Mobile-first PWA shell for iPhone Safari.
- Email account simulation with server-side mock storage.
- Lightweight profile saved by stable `user_id`.
- Workplace scenario/task selection.
- Seed task bank for meetings, project updates, requirement clarification, interviews, and follow-ups.
- Configurable practice length: quick 4 turns, workplace 6 turns, deep 8 turns.
- Reusable expressions grouped by work purpose: opening, clarifying, opinion, disagreeing, next step, follow-up.
- Role-play conversation with text fallback and Web Speech API when available.
- Workplace communication readiness estimate and dimension feedback.
- Logged-in history saved to a local server-side mock database.
- Structured user memory updates after assessment and recommends the next task.

## Not Yet Production

- Account/memory can run in Supabase code-ready mode when Supabase env vars are
  configured. Without those env vars, it falls back to the local JSON mock
  database at `data/account-memory-db.json`.
- No real WeChat OAuth, payment entitlement, or domestic compliance package.
- Speech reliability depends on browser Web Speech support.

## API Plan

Dialogue and assessment use `/api/coach` when `DEEPSEEK_API_KEY` is configured.
If the API is unavailable, the app falls back to local workplace prompts and
assessment in `app/page.tsx`.

Recommended product APIs:

- LLM: DeepSeek's OpenAI-compatible chat API or another workplace-safe model for role-play dialogue and post-practice assessment.
- Voice: browser Web Speech API for prototype fallback; server-side transcription for reliable iPhone support.
- Data: Supabase Auth/Postgres for users, profiles, topics, expression sets, and practice sessions.

Account + memory system notes are in `ACCOUNT_MEMORY_SYSTEM_PLAN.md`. P1
Supabase code-ready notes and SQL migration are in
`ACCOUNT_MEMORY_P1_SUPABASE.md` and `supabase/migrations/001_account_memory_p1.sql`.
`/api/account-memory` now falls back to the local mock when Supabase env vars are
absent, and switches to the Supabase adapter when they are present.

For DeepSeek, set a local environment variable. Do not commit or paste API keys:

```bash
DEEPSEEK_API_KEY=your_rotated_key
DEEPSEEK_MODEL=deepseek-chat
```

Domestic commercialization notes are in `DOMESTIC_COMMERCIALIZATION_PLAN.md`.

## Content Source Policy

The seed tasks are internally written workplace scenarios. For production, use
internally written scenarios, licensed training materials, or customer-approved
templates. Do not copy proprietary interview banks, client documents, or private
company playbooks without permission.
