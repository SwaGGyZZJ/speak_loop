# Account + Memory P1 Supabase Code-ready

This stage upgrades the local JSON account/memory mock toward a real cloud path while keeping the local fallback usable.

## Mode Selection

`/api/account-memory` chooses storage at runtime:

- Supabase mode when both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
- Local JSON fallback when either value is missing.

The fallback remains useful for local development and for environments where cloud credentials are not ready.

## Required Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is reserved for the browser auth UI path. The current code-ready server adapter uses the service role only inside Next.js API routes.

## Migration

Run the SQL in:

```text
supabase/migrations/001_account_memory_p1.sql
```

Tables:

- `app_users`
- `app_sessions`
- `user_profiles`
- `practice_sessions`
- `assessment_reports`
- `user_memory`
- `memory_events`
- `saved_phrases`

RLS is enabled and public client policies are intentionally not opened in this code-ready pass. Server routes use the Supabase service role.

## API Behavior

The existing `/api/account-memory` action contract is preserved:

- `login`
- `getState`
- `saveProfile`
- `saveSession`
- `deleteSession`
- `deleteHistory`
- `clearMemory`
- `deleteAccount`

Supabase mode returns `storageMode: "supabase"` in API responses.

In Supabase mode, `login` requires a valid `supabaseAccessToken`. The API reads
the canonical user id and email from `/auth/v1/user`; a client-provided email is
only accepted when it matches the Supabase Auth user. Email-only login is
available only in local JSON fallback mode.

Deletion behavior keeps the Phase 1-3 rules:

- `deleteSession` removes the session/report and rebuilds memory from remaining sessions.
- `saveSession` rejects a client-provided session id that already belongs to a
  different `user_id`.
- `deleteSession` deletes only with the current `id + user_id` pair.
- `deleteHistory` clears sessions, reports, memory, and writes a deleted memory event.
- `clearMemory` clears `user_memory` and writes a cleared event.
- `deleteAccount` deletes the user row; dependent rows cascade.

## Verification Levels

Code-ready can be verified without external resources:

```bash
npm run build
```

Local fallback can be verified without Supabase env:

```bash
npm run start -- --port 5174
```

Cloud-runnable requires real Supabase and Vercel env values, then Hank can verify:

- same account restores profile/history/memory across browser/device
- different accounts cannot access each other
- delete session/history/account removes DB data from prompts and state
- iPhone Safari can use the public deployment URL

## Current Limitation

This pass is code-ready. It does not prove real Supabase Auth email delivery or cross-device cloud persistence until Supabase/Vercel credentials are provided and deployed.
