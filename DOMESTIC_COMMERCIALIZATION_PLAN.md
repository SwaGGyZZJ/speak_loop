# SpeakLoop Domestic Commercialization Plan

## Decision

The current Vercel deployment is useful for overseas testing, but it is not a
valid mainland China commercial entry point. For domestic users, SpeakLoop needs
a China-accessible stack and a stronger paid-value loop.

Product conclusion: the current MVP is not "content-useless"; it proves the core
speaking loop. It is not yet commercial-grade because it does not persist user
value, control paid entitlements server-side, or prove progress over time.

## Current Gaps

### Access Gaps

- `*.vercel.app` is not reliable from mainland China.
- The current app has no mainland deployment, ICP-backed domain, domestic CDN,
  or domestic HTTPS path.
- User data is localStorage-first, so switching devices or reinstalling loses
  learning history.
- The app depends on server env for DeepSeek, but deployment/runtime health is
  not visible to users or operators.

### Commercial Function Gaps

- No real account system.
- No cloud practice history.
- No free/paid entitlement boundary.
- No server-side usage ledger for AI cost control.
- No payment, order, subscription, refund, or payment webhook handling.
- No detailed report archive, weak-point loop, or visible progress trend.
- No domestic login/payment/compliance documents.

## Minimum Commercial Product Loop

The minimum commercial product is not a full learning platform. It is a paid
learning loop that clearly demonstrates value:

1. User registers or logs in.
2. User chooses IELTS, TOEFL, or workplace English.
3. System provides target-band expressions.
4. User completes one voice practice round.
5. System generates a detailed scoring report.
6. Report is saved to the cloud.
7. Free users are limited; Pro users unlock more content, longer practice, and
   more history.

If these seven steps are not reliable, the product is not ready to charge.

## Free / Pro Design

### Free Plan

Purpose: prove one clear learning value without giving away the full product.

Recommended limits:

- 1 short practice per day.
- Limited curated topics.
- 3-4 dialogue turns per round.
- Basic scoring only:
  - estimated range
  - 2 improvement suggestions
- Keep only the latest 3 history records.
- Show Pro unlocks clearly but without repeated interruption.

Free plan success criterion: the user can see at least one real speaking problem
and one useful fix after a short practice.

### Pro Plan

Pro must feel more valuable than "more usage". The core selling point is:

```text
Not just chatting with you, but helping rewrite your answer closer to the target
score band.
```

Recommended Pro rights:

- More or unlimited practice.
- Full IELTS/TOEFL/workplace topic bank.
- 6/7/8-band expression comparison.
- Longer AI dialogue.
- Detailed scoring reports.
- Original-sentence correction and natural rewrites.
- Long-term history.
- Mistake notebook.
- Saved expressions.
- Weak-point based next practice.
- 7/14/30-day exam sprint plan.

## Content Requirements

The commercial version needs structured content, not a small sample set.

P0 content:

- IELTS Part 1, Part 2, and Part 3 frequent topics.
- TOEFL Independent and Integrated speaking common task types.
- Workplace English:
  - meetings
  - status updates
  - collaboration
  - interviews
  - customer communication
- Difficulty tags.
- Exam/task type tags.
- 6/7/8-band expression sets for each topic family.
- At least 2-3 follow-up paths per topic to avoid repeated practice feeling
  identical.

The first version does not need a complete real-exam database, but it must feel
systematic rather than randomly generated.

## Report Requirements

The scoring report is the main paid-value surface.

A commercial-grade mobile report should fit the 30-second scan pattern and
include:

- Practice estimated score range.
- Dimension feedback:
  - fluency
  - vocabulary
  - grammar
  - content development
  - naturalness
- 2-3 problems from the user's original sentences.
- More natural replacements.
- High-score expressions used in the current round.
- 3 repeat-practice sentences.
- One most important next improvement.

All scoring must remain clearly labeled as practice estimate, not official
IELTS/TOEFL scoring.

## Retention Requirements

Subscription retention should come from repractice and visible progress, not
novelty.

P0/P1 retention surfaces:

- Recent practice history.
- Mistake notebook.
- Saved expressions.
- Next recommended topic.
- Weakness labels:
  - answer too short
  - too few linking phrases
  - weak opinion development
  - repetitive vocabulary
  - grammar accuracy issue
- Weekly summary:
  - practice count
  - most common issue
  - recommended next focus

Avoid complex charts in P0; lightweight trends are enough.

## P0 / P1 / P2 Scope

### P0: Required Before Paid Launch

- Mainland-accessible deployment.
- Account login and cloud records.
- Free vs paid entitlement model.
- AI usage counting and cost limits.
- Detailed scoring report saved to user history.
- Basic IELTS/TOEFL topic bank with clear task types.
- Workplace English pilot category if domestic commercial positioning includes
  non-exam users.
- `practice estimate` compliance language in all scoring surfaces.
- Payment success immediately unlocks entitlement.
- Refresh, logout/login, and device switching keep membership and history
  correct.
- Customer support or feedback entry.
- Account deletion or data deletion path.

### P1: Improve Paid Value

- Mistake notebook.
- Saved expressions.
- Weak-point repractice.
- Progress trends by rubric dimension.
- 7/14/30-day exam prep plan.
- Larger topic bank and better 6/7/8-band expression quality.

### P2: Defer

- Native iOS/Android apps.
- Human teacher marketplace.
- Community, ranking, enterprise plans.
- Full course system.
- Fine-grained phoneme-level pronunciation scoring.

## Domestic Trial Path

Use this path for near-term iPhone testing in China before the full commercial
stack is ready.

### Option A: Fast Internal Trial

Target: run a China-accessible demo in 0.5-1 day after a cloud account/server is
available.

Architecture:

```text
iPhone Safari
  -> Cloud server public IP or temporary test domain
  -> Nginx/Caddy reverse proxy
  -> Next.js production server
  -> /api/coach
  -> DeepSeek API
```

Requirements:

- Mainland cloud server: Alibaba Cloud ECS, Tencent Cloud CVM/Lighthouse, or
  Huawei Cloud ECS.
- Open ports 80 and/or 443.
- Node.js 20+.
- `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL` configured on the server.
- PM2 or systemd to keep `next start` alive.

Limitations:

- Public IP + HTTP is acceptable only for internal testing.
- iPhone microphone and PWA behavior are more reliable on HTTPS.
- Formal public access should use an ICP-filed domain and HTTPS certificate.
- Payment and persistent user history are still not included.

### Option B: Public Domestic Trial

Target: stable phone trial with a real domain.

Architecture:

```text
app.speakloop.cn
  -> ICP-backed DNS
  -> Mainland CDN or cloud load balancer
  -> Nginx/Caddy
  -> Next.js app server
  -> Domestic database
  -> DeepSeek API
```

Requirements:

- Own domain.
- ICP filing through the chosen cloud provider.
- HTTPS certificate.
- Mainland cloud server or container service.
- Domestic database for users, sessions, and reports.

Expected blocker:

- ICP filing time varies by provider and region. It should be treated as a
  schedule dependency, not an engineering task that can be compressed safely.

## Commercial Architecture

### Recommended China Stack

Use one cloud provider for the first paid version to reduce ICP filing,
networking, and support complexity.

Alibaba Cloud route:

- ECS or SAE for app/API hosting.
- RDS PostgreSQL or MySQL.
- OSS for exported reports/audio if needed.
- CDN and DNS.
- SMS service for login.
- ICP filing through Alibaba Cloud.

Tencent Cloud route:

- CVM/Lighthouse or CloudBase/SCF where appropriate.
- TencentDB PostgreSQL/MySQL.
- COS for file storage.
- CDN and DNSPod.
- SMS service.
- WeChat Pay integration path is operationally natural here.
- ICP filing through Tencent Cloud.

Huawei Cloud route:

- ECS/CCI/FunctionGraph depending on operations preference.
- RDS, OBS, CDN, SMS.
- Useful if the team already has Huawei Cloud account/credits.

### Runtime Split

Domestic environment:

- Domain: `app.<domestic-domain>`.
- App/API: mainland cloud.
- AI: DeepSeek or other domestic-accessible provider.
- Login: phone/SMS first, WeChat later.
- Payment: WeChat Pay and Alipay.
- Database: mainland region.

Overseas environment:

- Domain: Vercel or overseas custom domain.
- App/API: Vercel.
- Payment: Stripe if needed.
- Database/API choices can remain overseas.

Keep separate:

- Environment variables.
- Database.
- Payment credentials.
- AI endpoint configuration.
- CDN/static asset domains.

## Data Model Needed for P0

Minimum tables:

```text
users
profiles
practice_sessions
practice_turns
assessment_reports
entitlements
usage_ledger
orders
payment_events
subscription_periods
```

Core rules:

- Entitlement must be checked server-side before creating AI requests.
- Every AI call writes a usage ledger row.
- Payment webhook handling must be idempotent.
- Reports must belong to authenticated users.
- Free users and paid users must share the same code path with different limits,
  not separate front-end-only switches.

## Required Code Changes

### Deployment Changes

- Add mainland server deployment guide.
- Add `Dockerfile` or systemd/PM2 scripts.
- Add health check endpoint, for example `/api/health`.
- Remove assumptions that Vercel is the only production target.
- Ensure no static assets use Google fonts or overseas CDN URLs.

### Product Changes

- Replace mock login/localStorage identity with real auth.
- Move practice history from localStorage to database.
- Add report detail page and history list backed by database.
- Add free/paid plan display and entitlement checks.
- Add paid-only detailed report and repractice suggestions.
- Add usage limit messages for free users and exhausted quota.

### Payment Changes

- Add order creation endpoint.
- Add payment webhook endpoint.
- Add subscription/entitlement activation logic.
- Add payment state UI:
  - pending
  - paid
  - failed
  - refunded
- Add retry and support contact path.

### Compliance Changes

- Add privacy policy.
- Add user agreement.
- Add paid service agreement.
- Add AI scoring disclaimer:
  - score is a `practice estimate`
  - not an official IELTS/TOEFL score
  - report is for practice guidance only
- Add consent copy for saving voice/text practice records.

## Estimated Timeline

Assuming cloud account and API credentials are ready:

| Phase | Scope | Estimate |
| --- | --- | --- |
| Domestic internal trial | ECS/CVM deploy, env config, reverse proxy, smoke test | 0.5-1 day |
| Public domestic access | Domain, ICP filing, HTTPS, CDN/basic monitoring | 1-3+ weeks depending on filing |
| Commercial P0 backend | Auth, database, reports, entitlements, usage ledger | 1-2 weeks |
| Payment P0 | WeChat/Alipay order flow, webhook, entitlement activation | 3-7 days |
| Product P0 polish | report archive, quota UI, practice estimate copy, support states | 3-5 days |

The shortest practical route is:

1. Start mainland server trial immediately.
2. Start domain/ICP filing in parallel.
3. Build auth/history/entitlement while ICP is pending.
4. Add payment after entitlement and usage ledger are stable.

## Acceptance Checklist

### Domestic Access

- iPhone Safari opens the domestic URL without VPN.
- Home, manifest, icons, and CSS load without overseas blocked assets.
- Recording/text fallback works.
- `/api/coach` returns DeepSeek response without VPN.
- Refresh and re-open remain usable.

### Paid Entitlement

- Free user can complete limited short practice.
- Free limit message is clear and non-blocking.
- Paid user gets longer practice, full history, detailed reports, and repractice
  suggestions.
- Membership state survives refresh, logout/login, and device switch.
- AI quota exhaustion does not produce blank screens or repeated charges.

### Payment

- Payment success unlocks entitlement immediately.
- Duplicate webhook does not duplicate membership or charges.
- Payment failure shows a recoverable state.
- Refund or manual revocation updates entitlement.

### Compliance

- Every score is labeled as practice estimate.
- Privacy policy explains voice/text record storage.
- Paid agreement explains membership limits and refunds.
- No credentials are exposed in frontend code or public logs.

## P0 Blockers

Do not charge users while any of these blockers remain:

- Mainland mobile network cannot access the app reliably, or key APIs require
  VPN.
- History disappears after refresh/re-login, or users can see each other's
  records.
- Free/Pro entitlements are checked only in frontend code.
- AI scoring does not cite transcript evidence and only gives generic advice.
- Score copy is not labeled as practice estimate.
- AI/API failure causes blank screen, stuck UI, repeated quota deduction, or
  repeated charge.
- Payment success does not sync entitlement immediately.
- Payment failure/refund state has no clear handling.
- Mobile core actions require long scrolling or cannot be completed one-handed.
- Voice permission denial has no text-input fallback.
- Privacy policy, user agreement, data deletion, or account cancellation path is
  missing.

## References

- Vercel China mainland access note:
  https://vercel.com/kb/guide/accessing-vercel-hosted-sites-from-mainland-china
- Alibaba Cloud ICP filing guide:
  https://help.aliyun.com/zh/icp-filing/
- Tencent Cloud ICP filing:
  https://cloud.tencent.com/document/product/243
- China MIIT ICP/IP address/domain filing system:
  https://beian.miit.gov.cn/
