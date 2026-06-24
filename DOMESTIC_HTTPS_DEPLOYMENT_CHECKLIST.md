# Voice Coach Domestic HTTPS Deployment Checklist

Goal: deploy ENGmvp Voice Coach P1 to an HTTPS URL that Frank can open on iPhone Safari without VPN.

## Recommended Shortest Path

Use Alibaba Cloud SAE with a container image.

Reason: ENGmvp is a Next.js app with API routes (`/api/coach`, `/api/account-memory`), DeepSeek server calls, and account-memory/Supabase paths. It needs a Node/Next.js runtime. It is not a pure static site and should not be deployed as OSS-only static hosting.

## Required Resources

Resource owner must provide:

- Alibaba Cloud account with SAE enabled.
- SAE prerequisites: VPC, vSwitch, namespace, and required RAM permissions.
- Container image registry, such as Alibaba Cloud ACR.
- Domain or subdomain for the app.
- HTTPS certificate for that domain.
- ICP filing if the domain points to a mainland China runtime.
- Production environment variables:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_MODEL`
  - Optional cloud account/memory:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`

Keep build-time public env separate from runtime secrets:

- Build-time public env:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Runtime server env:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_MODEL`
  - `SUPABASE_SERVICE_ROLE_KEY`

Do not pass server secrets as Docker build args. Build args can be stored in image build metadata and should only be used for public `NEXT_PUBLIC_*` values.

## App Build Shape

This folder now includes:

- `Dockerfile`
- `.dockerignore`

The container runs:

```bash
npm ci
npm run build
npm run start -- --port 3000
```

Container service port:

```text
3000
```

## Deployment Steps

1. Build the image from `mvp-next`.

```bash
cd mvp-next
docker build -t speakloop-voice-coach:p1 .
```

If Supabase cloud account/memory is enabled, pass public Supabase values at build time:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>" \
  -t speakloop-voice-coach:p1 .
```

2. Push the image to a registry accessible by the domestic cloud runtime.

Example target shape:

```text
registry.cn-<region>.aliyuncs.com/<namespace>/speakloop-voice-coach:p1
```

3. Create an SAE Web application.

Recommended settings:

- Deployment mode: container image.
- Image: the pushed `speakloop-voice-coach:p1` image.
- Container port: `3000`.
- Startup command: use image default command.
- Environment variables: add runtime production env. At minimum:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_MODEL`
  - `SUPABASE_SERVICE_ROLE_KEY` if Supabase account/memory is enabled.

Do not put `SUPABASE_SERVICE_ROLE_KEY` into Docker build args.

4. Verify the temporary SAE endpoint if provided.

Minimum checks:

```text
GET /
GET /manifest.webmanifest
POST /api/coach
```

5. Bind a custom domain.

Required:

- Add DNS CNAME to the public endpoint provided by SAE.
- Create SAE custom domain.
- Bind custom domain to the web app.
- Enable HTTPS and select the certificate.

Important: for mainland HTTPS custom domain access, make sure ICP filing is complete before final acceptance.

6. Final URL shape:

```text
https://<domain>/
```

## Acceptance Checklist

Machine-side:

- `https://<domain>/` returns 200.
- `https://<domain>/manifest.webmanifest` returns 200.
- `/api/coach` returns a DeepSeek or fallback dialogue response.
- No secrets are exposed in client HTML.
- The app loads on mobile viewport.

iPhone Safari:

- Open `https://<domain>/`.
- Enter a scenario and start practice.
- Allow microphone permission when prompted.
- User speaks or types an English reply.
- AI coach automatically plays voice reply.
- Replay last AI reply works.
- Stop AI voice works.
- Fallback text is visible if microphone or TTS fails.
- Report generation still works.
- Logged-in history/memory works if Supabase env vars are configured.

## If Domestic Resources Are Not Ready

Use a machine/network that can access Vercel and deploy Option A from `VOICE_COACH_DEPLOYMENT_OPTIONS.md`.

That gives a fast overseas/VPN HTTPS URL, but it does not satisfy Frank's no-VPN mainland iPhone requirement.

## Official References

- SAE preparation: https://help.aliyun.com/zh/sae/sae-2-preparations
- SAE usage flow: https://help.aliyun.com/zh/sae/get-started-with-sae
- Deploy Web applications to SAE: https://help.aliyun.com/zh/sae/web-application-use-cases/
- SAE custom domain and HTTPS: https://help.aliyun.com/zh/sae/access-apps-through-a-custom-domain-name
- SAE HTTPS/ICP requirement for routing: https://help.aliyun.com/zh/sae/set-routing-rules-for-an-application-alb/
