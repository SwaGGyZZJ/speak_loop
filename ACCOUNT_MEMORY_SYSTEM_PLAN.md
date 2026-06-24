# SpeakLoop Account + Memory System P0

## Goal

Upgrade SpeakLoop from a local Workplace Speaking prototype into a persistent
coach that recognizes the user across sessions and improves personalization over
time.

P0 should prove:

1. A user can log in with a stable account.
2. Practice history is saved to the cloud.
3. The system maintains a structured memory of the user's role, goals, weak
   areas, and recurring speaking problems.
4. The next practice uses that memory to recommend tasks and personalize
   feedback.

This is not a full CRM, not an unlimited chat memory system, and not a
black-box transcript dump into every prompt.

## Product Scope

### P0

- Email sign-up and login.
- Stable user ID.
- Cloud profile:
  - current English level
  - work role
  - industry or work context
  - common scenarios
  - speaking goal
- Cloud practice history:
  - selected task
  - selected expressions
  - transcript
  - assessment report
  - created time
- Structured user memory:
  - recurring weak areas
  - preferred practice mode
  - recent scenario focus
  - recommended next task
  - saved phrases and sentence rewrites
- Memory-informed practice:
  - homepage recommendation
  - prompt includes profile + memory summary + recent weak areas
  - report can mention progress compared with recent practice
- User can view and delete practice history.

### P0/P1 Boundary

- WeChat login should be designed in P0 and implemented when domestic product
  environment is ready.
- For domestic commercial launch, WeChat login becomes required.
- Before that, email login can unblock account, memory, and history design.

### Not P0

- Unlimited long-term conversational memory.
- Feeding all past transcripts into every AI prompt.
- Complex CRM-style user profile.
- Enterprise admin accounts.
- Native app account system.
- Payment-linked entitlement logic, except reserving table hooks.

## Recommended Architecture

### Fastest P0 Stack

Use Supabase for the first technical P0 if overseas access is acceptable for
internal validation:

- Supabase Auth for email login.
- Supabase Postgres for profile, sessions, reports, and memory.
- Next.js server routes for memory update and AI prompt construction.

This is fast but not final for mainland China commercial use.

### Domestic Commercial Stack

For China launch, use a mainland cloud provider:

- Auth:
  - email/password or email magic link
  - phone/SMS login if domestic mobile-first
  - WeChat OAuth through WeChat Open Platform or official account flow
- Database:
  - Alibaba Cloud RDS, TencentDB, Huawei Cloud RDS, or self-managed Postgres
- App/API:
  - mainland ECS/CVM/SAE/container service
- Storage:
  - OSS/COS/OBS if audio exports or report files are added later

Keep provider-specific OAuth secrets server-side only.

## Data Model

### users

Canonical user identity. If using Supabase/Auth provider, this may map to the
provider auth user table.

```text
id uuid primary key
email text unique
wechat_openid text unique nullable
wechat_unionid text unique nullable
display_name text nullable
avatar_url text nullable
created_at timestamptz
updated_at timestamptz
deleted_at timestamptz nullable
```

### auth_identities

Provider identities linked to one canonical user. This keeps email, WeChat, and
future phone/SMS login from creating duplicate learning histories.

```text
id uuid primary key
user_id uuid references users(id)
provider text -- email, wechat, phone
provider_user_id text
email text nullable
wechat_openid text nullable
wechat_unionid text nullable
created_at timestamptz
updated_at timestamptz
unique(provider, provider_user_id)
```

### user_profiles

Can be named `profiles` in code if the auth provider already owns a `users`
schema, but it represents the product-level user profile.

User-editable learning and work context.

```text
user_id uuid primary key references users(id)
current_level text
current_role text
target_role text
industry text
work_context text
common_scenarios text[]
communication_goal text
weak_areas text
preferred_mode text
created_at timestamptz
updated_at timestamptz
```

### workplace_tasks

Cloud-backed task definitions. P0 can seed from the current in-code tasks.

```text
id text primary key
category text
category_label text
title text
role text
audience text
goal text
situation text
difficulty text
turns int
task_type text
success_criteria jsonb
expressions jsonb
is_active boolean
created_at timestamptz
updated_at timestamptz
```

### practice_sessions

One completed or in-progress role-play.

```text
id uuid primary key
user_id uuid references users(id)
task_id text references workplace_tasks(id)
practice_mode text
selected_expressions text[]
status text -- started, completed, failed
started_at timestamptz
completed_at timestamptz nullable
created_at timestamptz
```

### practice_turns

Transcript lines, stored separately so reports and memory can cite evidence.

```text
id uuid primary key
session_id uuid references practice_sessions(id)
turn_index int
role text -- ai, user
text text
created_at timestamptz
```

### assessment_reports

Structured report generated after a session.

```text
id uuid primary key
session_id uuid references practice_sessions(id)
user_id uuid references users(id)
score_range text
completion_summary text
clarity text
naturalness text
professional_tone text
interaction text
task_completion text
sentence_rewrites jsonb
repeat_sentences text[]
raw_model_output jsonb
created_at timestamptz
```

### user_memory

Current structured coaching memory. Keep this short and editable/deletable.

```text
user_id uuid primary key references users(id)
summary text
recurring_weaknesses jsonb
recommended_scenarios jsonb
saved_phrases jsonb
last_practice_at timestamptz nullable
memory_version int
created_at timestamptz
updated_at timestamptz
```

Example `recurring_weaknesses`:

```json
[
  {
    "label": "missing next step",
    "evidence": "Often explains a delay but does not propose owner/date",
    "count": 3,
    "last_seen": "2026-06-17T10:00:00Z"
  }
]
```

### memory_events

Append-only audit log of memory changes.

```text
id uuid primary key
user_id uuid references users(id)
session_id uuid nullable references practice_sessions(id)
event_type text -- created, updated, user_edited, deleted
before jsonb nullable
after jsonb nullable
reason text
created_at timestamptz
```

### saved_phrases

User-visible reusable phrase library.

```text
id uuid primary key
user_id uuid references users(id)
source_session_id uuid nullable references practice_sessions(id)
phrase text
example text
usage_note text
category text
created_at timestamptz
deleted_at timestamptz nullable
```

## Memory Update Flow

### On Assessment Completion

1. Save session and transcript.
2. Save assessment report.
3. Generate a compact memory update from:
   - existing profile
   - current user memory
   - current report
   - 2-3 transcript evidence lines
4. Validate the update schema.
5. Merge into `user_memory`.
6. Append a `memory_events` row.
7. Show user-visible memory changes in the report or profile page.

### Memory Update Prompt Contract

The model should return strict JSON:

```json
{
  "summary_delta": "short update about the user's current speaking pattern",
  "recurring_weaknesses": [
    {
      "label": "missing next step",
      "evidence": "The user explained a delay but did not give owner/date",
      "severity": "medium"
    }
  ],
  "recommended_next_task": {
    "category": "Project Update",
    "reason": "Needs more practice turning problems into action plans"
  },
  "saved_phrases": [
    {
      "phrase": "My recovery plan is...",
      "usage_note": "Use after explaining a delay"
    }
  ]
}
```

Do not store sensitive or inferred personal facts unless the user explicitly
provided them and they are useful for coaching.

## Prompt Usage

Next practice should include only compact context:

```text
Profile:
- role
- industry/work context
- communication goal

Memory summary:
- 3-5 sentence summary
- top 1-3 recurring weaknesses
- last recommended scenario

Recent session:
- previous task title
- 1 key improvement
- 1 remaining issue
```

Avoid:

- sending all transcripts every time
- including deleted sessions
- using memory for hidden judgments outside coaching

## API Surface

### Auth

```text
POST /api/auth/email/start
POST /api/auth/email/verify
GET  /api/auth/me
POST /api/auth/logout
GET  /api/auth/wechat/start
GET  /api/auth/wechat/callback
```

If using Supabase or a provider SDK, these can map to SDK calls instead of
custom routes.

### Profile

```text
GET  /api/profile
PUT  /api/profile
DELETE /api/account
```

### Sessions

```text
POST /api/practice-sessions
POST /api/practice-sessions/:id/turns
POST /api/practice-sessions/:id/assessment
GET  /api/practice-sessions
GET  /api/practice-sessions/:id
DELETE /api/practice-sessions/:id
```

### Memory

```text
GET  /api/memory
PUT  /api/memory
POST /api/memory/rebuild
DELETE /api/memory
```

P0 can skip `rebuild` if implementation time is tight.

## UI Changes

### Home

- Show login state.
- Show recommended next task:
  - "Recommended because you often miss next steps in project updates."
- Show last weak area.

### Profile

- Add editable work profile.
- Add "What SpeakLoop remembers about me" section.
- Let user edit or clear memory summary.

### History

- Move history from localStorage to cloud.
- Show session report detail.
- Show saved phrases and repeat sentences.

### Report

- Add "Memory updated" block:
  - new weak area found
  - phrase saved
  - next task recommended
- Allow user to reject a memory update if it is wrong.

## Privacy And Control

P0 must include:

- User can view stored profile and memory.
- User can delete practice sessions.
- User can clear memory summary.
- User can delete account and associated user data.
- Privacy copy explains:
  - transcripts and reports may be stored
  - memory is used to personalize coaching
  - user can delete data

Do not store API keys, payment credentials, or OAuth secrets in browser storage.

## Implementation Phases

### Phase 1: Cloud Identity And Profile

- Add auth provider.
- Replace localStorage user identity with authenticated user ID.
- Add `user_profiles` / product `profiles`.
- Keep local task bank initially.

Acceptance:

- Email login works.
- Refresh and re-login preserve profile.
- Logged-out user cannot read another user's profile.

### Phase 2: Cloud Sessions And Reports

- Add sessions, turns, reports.
- Save completed Workplace practice to database.
- Replace localStorage history with cloud history.

Acceptance:

- Complete a role-play, log out, log in again, history remains.
- Another account cannot see the session.

### Phase 3: Structured Memory

- Add `user_memory` and `memory_events`.
- Generate memory update after assessment.
- Add memory-informed recommendation and prompt context.

Acceptance:

- After two sessions, homepage recommends a task based on weak areas.
- The next AI prompt receives memory summary and adapts feedback.
- User can view and clear memory.

### Phase 4: WeChat Login Design/Implementation

- Add WeChat OAuth route.
- Link WeChat identity to existing email account when possible.
- Handle duplicate account and account linking states.

Acceptance:

- WeChat login creates or links a stable user.
- Re-login returns the same profile/history.
- Failed OAuth and canceled authorization show recoverable states.

## Testing Checklist

- Email sign-up/login/logout.
- Refresh keeps login session.
- Re-login on another browser/device restores profile and history.
- User A cannot access User B's sessions, reports, memory, or phrases.
- Completing a practice creates session, turns, report, and memory event.
- Memory summary changes after repeated weakness appears.
- Recommendation changes based on memory.
- User can delete a session.
- User can clear memory.
- User can delete account.
- AI prompt does not include deleted history.
- WeChat OAuth failure/cancel states are handled when implemented.

## Open Decisions

- Auth provider for P0:
  - Supabase fastest for prototype.
  - Domestic provider/custom auth better for China launch.
- Whether phone/SMS login should precede email for domestic users.
- Whether WeChat login is P0 implementation or P0 design + P1 implementation.
- Data retention period for transcripts and reports.
- Whether audio is stored at all; P0 should avoid storing audio unless required.
