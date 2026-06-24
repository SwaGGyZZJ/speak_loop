# SpeakLoop Deployment Plan

## Current Local Service

The current production-style Next.js server is running on:

```text
http://localhost:5174
```

The current Wi-Fi interface address is:

```text
http://100.70.218.107:5174
```

Use this for immediate iPhone testing only if the iPhone can reach the same
network/VPN segment. This URL is HTTP, so some iPhone microphone/PWA behavior may
be limited.

## Immediate iPhone Test

1. Keep the Mac awake.
2. Keep the server running:

```bash
cd /Users/zijianhuawei/.slock/agents/6c90c3be-80e8-44e9-b0c1-806d74e0a8fb/mvp-next
npm run start -- --port 5174
```

3. On iPhone Safari, open:

```text
http://100.70.218.107:5174
```

4. Test:
   - Open home.
   - Choose a Workplace task.
   - Select scenario expressions.
   - Complete one short role-play.
   - Confirm DeepSeek dialogue and workplace assessment work.

Network conditions:

- The iPhone must be on the same reachable LAN/VPN segment as this Mac.
- If `http://100.70.218.107:5174` does not open, confirm both devices are on the
  same Wi-Fi/VPN and that macOS firewall allows inbound connections for Node.
- This path is for internal testing only. It is HTTP, so iPhone microphone/PWA
  behavior may be less reliable than HTTPS.

## Temporary HTTPS Test

Mobile microphone and PWA behavior are more reliable on HTTPS.

Tried `localtunnel`:

```bash
npx --yes localtunnel --port 5174
```

It produced a URL but returned 502/408 during verification, so it is not reliable
enough for handoff right now.

Alternative temporary tunnel options:

- Cloudflare Tunnel with `cloudflared tunnel --url http://localhost:5174`.
- ngrok with `ngrok http 5174`.

These require the tunnel tool to be installed or authenticated.

## Recommended Public Deployment

Use Vercel for the first public HTTPS test URL because this is a Next.js app and
Vercel handles HTTPS, routing, and serverless API routes.

Current production URL:

```text
https://speakloop-pwa-mvp.vercel.app
```

Deployment state checked on 2026-06-16:

- Vercel project: `frank-zzj-s-projects/speakloop-pwa-mvp`
- Production deployment: `dpl_HFER93dtsJsfhThQPGNams8Ft2tK`
- Vercel status: Ready
- Production env vars present and encrypted:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_MODEL`

Local verification note: this Mac can access `https://vercel.com`, and
`http://*.vercel.app` returns Vercel's HTTPS redirect, but direct
`https://*.vercel.app` requests are reset/timed out from this network. The
deployment is ready from Vercel's side, but final app/API smoke testing should be
done from iPhone Safari or another network.

### Steps

1. Deploy `mvp-next/` as the project root.
2. Set environment variables in Vercel:

```text
DEEPSEEK_API_KEY=<rotated key>
DEEPSEEK_MODEL=deepseek-chat
```

3. Build command:

```bash
npm run build
```

4. Start command is handled by Vercel.
5. Test the generated HTTPS URL on iPhone Safari.

### Vercel Project Settings

Use these settings if creating the project manually:

```text
Framework Preset: Next.js
Root Directory: mvp-next
Build Command: npm run build
Output Directory: default / leave empty
Install Command: default / leave empty
```

Files added for deployment:

- `vercel.json` sets the framework and build command.
- `.vercelignore` prevents uploading local secrets and generated folders.

### Vercel CLI Path

If Vercel CLI is installed and logged in:

```bash
cd /Users/zijianhuawei/.slock/agents/6c90c3be-80e8-44e9-b0c1-806d74e0a8fb/mvp-next
npx vercel
```

For production:

```bash
npx vercel --prod
```

The CLI will ask for project setup the first time. Do not paste API keys into
the CLI prompts unless they are explicitly environment variable prompts; prefer
setting them in the Vercel dashboard.

### Deployment Safety Check

Before any production or domestic-server deployment, verify TLS certificate
validation is not disabled:

```bash
env | grep NODE_TLS_REJECT_UNAUTHORIZED
```

The command should print nothing. If it prints `NODE_TLS_REJECT_UNAUTHORIZED=0`,
unset it before building or starting the app:

```bash
unset NODE_TLS_REJECT_UNAUTHORIZED
```

Do not add this variable to server env, process managers, shell profiles,
Dockerfiles, CI, Vercel, or domestic cloud runtime settings.

## Domestic Phone Trial Path

For the next China-accessible phone test, use one of these paths:

### Same-Network Internal Trial

- Keep this Mac running `npm run start -- --port 5174`.
- Open `http://100.70.218.107:5174` on iPhone Safari.
- Works only when the phone can reach the Mac on the same network/VPN.
- Best for quick internal validation; not appropriate for customer trials.

### Mainland Cloud Trial

Use this once a mainland cloud server is available:

1. Provision Alibaba Cloud ECS, Tencent Cloud CVM/Lighthouse, or Huawei Cloud ECS.
2. Install Node.js 20+.
3. Upload or clone `mvp-next/`.
4. Set server env vars:

```text
DEEPSEEK_API_KEY=<server-side key>
DEEPSEEK_MODEL=deepseek-chat
```

5. Confirm `NODE_TLS_REJECT_UNAUTHORIZED` is not set.
6. Build and run:

```bash
npm install
npm run build
npm run start -- --port 5174
```

7. Open server firewall/security group for the test port, or reverse proxy
   port 80/443 to 5174 with Nginx/Caddy.
8. Test from iPhone Safari using the server IP or test domain.

Limitations:

- Public IP + HTTP is internal-trial only.
- A real public domestic domain should complete ICP filing before pointing to a
  mainland server/CDN.
- HTTPS is required for more reliable PWA and microphone behavior.

## iPhone HTTPS Trial Checklist

After a Vercel, domestic cloud, or other HTTPS URL is available:

1. Open the URL in iPhone Safari.
2. Choose a Workplace task from Project Update or Requirement Clarification.
3. Confirm the task card shows role, audience, goal, and workplace context.
4. Select one or two reusable workplace expressions.
5. Complete a quick or standard role-play with voice input or text fallback.
6. Confirm DeepSeek gives a workplace-specific follow-up, not generic chat.
7. Finish and confirm the report shows:
   - completion summary
   - task completion feedback
   - sentence rewrites
   - repeat sentences for the next real work situation
8. Try "Add to Home Screen" from Safari share menu.

## Production Notes

- Do not paste API keys in public channels.
- Use only rotated keys in deployment environment variables.
- Current login/history are localStorage only; Vercel deployment will not provide
  real cross-device login persistence until Supabase or another backend is added.
- DeepSeek calls run server-side through `/api/coach`, so the browser does not
  receive the API key.

## Next Deployment Upgrade

After the iPhone test confirms the flow:

1. Add Supabase Auth.
2. Add Postgres tables for profiles, topics, expression sets, practice sessions.
3. Persist history server-side.
4. Add server-side audio transcription for iPhone Safari robustness.
