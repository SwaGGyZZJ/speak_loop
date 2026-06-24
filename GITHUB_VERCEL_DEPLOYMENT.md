# GitHub + Vercel Deployment

Goal: deploy the latest Voice Coach P1 code through Vercel's Git integration, avoiding local `vercel login` / CLI TLS failures.

## Current Repo State

- The deployable app root is this folder: `mvp-next`.
- There is no GitHub remote configured in this workspace.
- `.gitignore` excludes local build output, local env files, Vercel metadata, and mock database files.
- Do not commit `.env.local`, API keys, or `data/account-memory-db.json`.

## Option A: Create a Dedicated GitHub Repo From `mvp-next`

Recommended. This keeps the GitHub repo root equal to the Next.js app root.

From this machine or another machine with GitHub access:

```bash
cd mvp-next
git init
git add .
git commit -m "Deploy Voice Coach P1"
git branch -M main
git remote add origin git@github.com:<OWNER>/<REPO>.git
git push -u origin main
```

If using HTTPS remote instead of SSH:

```bash
git remote add origin https://github.com/<OWNER>/<REPO>.git
git push -u origin main
```

## Option B: Push The Whole Workspace

Use only if the GitHub repo already contains multiple projects.

Vercel project settings must set:

```text
Root Directory: mvp-next
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

## Vercel Web Setup

In the Vercel dashboard:

1. Open project `speakloop-pwa-mvp`.
2. Connect the GitHub repo and branch.
3. Confirm the root directory:
   - Dedicated repo: leave root as project root.
   - Whole workspace repo: set root directory to `mvp-next`.
4. Add production environment variables:
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_MODEL=deepseek-chat`
5. Optional Supabase cloud memory:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Trigger Production Deploy from the Vercel dashboard.

Expected production URL:

```text
https://speakloop-pwa-mvp.vercel.app
```

## Verification

After Vercel deploy is Ready:

- Open `https://speakloop-pwa-mvp.vercel.app`.
- Confirm the Voice Coach UI is present.
- Start a workplace practice.
- AI opening line should auto-play using browser voice.
- User can speak or type.
- AI reply should auto-play after the next turn.
- Replay and stop controls should work.
- `/api/coach` should return DeepSeek responses if env is configured; otherwise local fallback is expected.

## Security Notes

- Never commit `DEEPSEEK_API_KEY`.
- Never commit `SUPABASE_SERVICE_ROLE_KEY`.
- Do not commit `.env.local`.
- Do not commit local mock data under `data/`.
