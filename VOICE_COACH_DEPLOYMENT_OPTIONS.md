# Voice Coach P1 Deployment Options

Task #16 goal: give Frank an HTTPS URL he can open on iPhone Safari to test Voice Coach P1.

## Current Status

- Code: ready.
- Build: `npm run build` passes.
- Local production server: `http://localhost:5174`.
- Vercel project: `speakloop-pwa-mvp`.
- Blocker on this Mac: Vercel control-plane TLS/network connectivity fails before upload.

Observed failures:

- `curl -I https://vercel.com`: `LibreSSL SSL_connect: SSL_ERROR_SYSCALL`.
- `npx vercel --prod --yes`: fails during project retrieval / OpenID config fetch with socket reset or socket hang up.
- Unsetting `NODE_TLS_REJECT_UNAUTHORIZED` restores TLS verification but fails local issuer validation, so the local TLS environment/network still cannot complete Vercel deployment.

## Option A: Overseas/VPN HTTPS via Vercel

Use when the goal is fastest iPhone trial on a network that can access Vercel.

Needed:

- A machine/network that can reach `https://vercel.com`.
- Existing Vercel login/project access for `speakloop-pwa-mvp`.
- Production env vars:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_MODEL`
  - Optional cloud account/memory envs:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`

Deploy command:

```bash
cd mvp-next
npm run build
npx vercel --prod --yes
```

Expected URL:

- `https://speakloop-pwa-mvp.vercel.app`

Acceptance:

- HTTPS homepage opens.
- iPhone Safari can enter practice.
- Microphone permission prompt appears.
- User speaks or types.
- AI coach auto-plays spoken reply.
- Replay and stop controls work.
- If Vercel is not reachable without VPN, mark domestic no-VPN acceptance as failed.

## Option B: Domestic HTTPS Deployment

Use when Frank needs iPhone access without VPN in mainland China.

Because ENGmvp uses Next.js API routes, DeepSeek calls, and account-memory endpoints, this cannot be deployed as a pure OSS static site like TODOmvp. It needs a runtime that can execute Node/Next.js server code.

Required resources:

- Domestic cloud runtime that supports Next.js/Node server:
  - Alibaba Cloud ECS, SAE, FC custom runtime, Tencent Cloud Lighthouse/CVM/SCF, or similar.
- Domain name for the app.
- HTTPS certificate.
- ICP filing if using mainland China servers/domains.
- Environment variables:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_MODEL`
  - `NEXT_PUBLIC_SUPABASE_URL` if cloud account/memory is enabled.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` if cloud account/memory is enabled.
  - `SUPABASE_SERVICE_ROLE_KEY` if cloud account/memory is enabled.
- Reverse proxy or platform routing to the Next.js server.

Deployment shape:

```bash
cd mvp-next
npm ci
npm run build
npm run start -- --port 3000
```

Reverse proxy:

- `https://<domain>` -> `127.0.0.1:3000`

Acceptance:

- `https://<domain>/` opens on Frank's iPhone Safari without VPN.
- `https://<domain>/manifest.webmanifest` works.
- `/api/coach` works with production env vars.
- Voice Coach flow works: microphone, AI voice autoplay, replay, stop, fallback text.
- Account/memory works if Supabase env vars are configured.

## Decision

If the immediate goal is a quick trial, use Option A from a Vercel-capable network/machine.

If the goal is Frank's normal mainland iPhone usage without VPN, use Option B and prepare domestic cloud/domain/HTTPS/ICP resources.
