# FitTrack → GymOS: Super-App Build Specification

**Author:** Dushan Liyanage (`iamdushanl`)
**Base repo:** `github.com/iamdushanl/Fitness_Tracker`
**Target execution environment:** Google Antigravity (Agent Manager + Editor)
**Spec version:** 1.0
**Status:** Ready for agent execution

---

## 0. How to use this document with Antigravity

This file is not a README. It is an **agent-executable backlog**. Each epic in §6 is written so that one Antigravity agent can own it end-to-end without you re-explaining context.

### 0.1 Repository preparation (do this once, manually)

```bash
git checkout -b feat/gymos-foundation
mkdir -p .agents/skills .agents/workflows docs/adr
touch AGENTS.md
```

Then paste §10 into `AGENTS.md`, §11 into `.agents/skills/`, and §12 into `.agents/workflows/`.

### 0.2 The execution loop (mandatory per epic)

Antigravity produces **Artifacts** — implementation plans, task lists, walkthroughs and browser recordings — and these are your trust layer: you verify the agent's logic without reading every diff. Use them.

```
┌─ L0  BRIEF ────────────────────────────────────────────┐
│  Open Agent Manager (CMD/CTRL+E) → new conversation.   │
│  Prompt: "Read docs/BUILD_SPEC.md §6 epic F0X.         │
│           Produce an implementation plan only.          │
│           Do not write code yet."                       │
├─ L1  PLAN REVIEW ──────────────────────────────────────┤
│  Agent emits an Implementation Plan artifact.          │
│  You comment inline on any section that is wrong.      │
│  Agent revises WITHOUT restarting the task.            │
├─ L2  IMPLEMENT ────────────────────────────────────────┤
│  "Approved. Execute the plan. Stop after each task     │
│   in the task list and report."                         │
├─ L3  VERIFY ───────────────────────────────────────────┤
│  Agent runs the epic's Definition of Done commands.    │
│  Browser-control run for any UI epic → recording.      │
├─ L4  CRITIQUE (second agent) ──────────────────────────┤
│  New conversation, SAME workspace:                      │
│  "You are a reviewer. Do not modify code. Audit the    │
│   diff on branch X against §6 F0X acceptance criteria  │
│   and AGENTS.md. Output a numbered defect list."        │
├─ L5  RECONCILE ────────────────────────────────────────┤
│  Feed the defect list back to the builder agent.       │
│  Repeat L2–L4 until the reviewer returns zero P1/P2.   │
│  If the agent drifted badly: "Undo changes up to       │
│  this point" and re-brief.                              │
└─ EXIT: reviewer clean + CI green + ADR written ────────┘
```

**Rules for this loop (learned the hard way, enforce them):**

1. **Never let the builder agent review its own work.** Separate conversation, explicitly read-only mandate.
2. **One epic per branch, one branch per agent.** Parallel agents on the same files cause merge chaos.
3. **Planning mode first, always.** A wrong plan costs one comment; wrong code costs a rollback.
4. **Every epic ends with an ADR** in `docs/adr/NNNN-title.md`. This is how you prevent instruction drift across weeks.

---

## 1. Strategic position (read before writing code)

### 1.1 What FitTrack is today

| Layer | Current state |
|---|---|
| Frontend | React 19 + Vite SPA → Vercel |
| Backend | Node.js + Express REST API → Docker → ECR → ECS (`us-east-1`) |
| Data | Supabase (Auth + Postgres), RLS `auth.uid() = user_id` |
| Logic | Server-authoritative streaks, volume comparison, ±10% weekly adaptation with 0.5×–1.5× guardrails |
| CI/CD | GitHub Actions: frontend lint+build; backend ECR push + ECS force-deploy |
| Docs | `SPEC.md`, `ARCH.md`, `CONFIG_AND_SECRETS.md`, `KNOWN-ISSUES.md` |

### 1.2 What actually makes this sellable to gyms

| Edition | Buyer | Core value |
|---|---|---|
| **FitTrack Personal** (free/freemium) | Individual lifter | Best-in-class training engine — your acquisition funnel |
| **GymOS Pro** (B2B SaaS, per-gym/month) | Gym owner | Multi-tenant member management, classes, attendance, billing, trainer oversight, branded member app |

### 1.3 ⚠️ Licence constraint — non-negotiable

- ❌ Do **not** copy openGym source into this repo. Not a file, not a function, not a `git clone && cp`.
- ✅ You **may** implement the same *features* — functional ideas and behaviours are not copyrightable.
- ✅ Work from this spec, which is written in behavioural terms precisely so your agents never touch AGPL code.

---

## 2. Gap matrix — openGym capability → FitTrack status

(See full spec for complete gap matrix with 55 capabilities across training engine, session, analytics, platform, and gym vertical)

---

## 3. Target architecture

```
                         ┌─────────────────────────────────┐
  Member PWA  ──────────▶│  Vercel (edge)                  │
  Trainer app            │   apps/web   (React 19 + Vite)  │
  Owner console          │   apps/console                  │
                         └───────────────┬─────────────────┘
                                         │ HTTPS  (JWT: sub, tenant_id, role)
                                         ▼
                         ┌─────────────────────────────────┐
                         │  AWS ECS Fargate                │
                         │   apps/api (Express)            │
                         │    ├─ /v1/training/*            │
                         │    ├─ /v1/gym/*        (tenant) │
                         │    ├─ /v1/admin/*      (owner)  │
                         │    └─ /v1/coach/*      (LLM)    │
                         └───────┬──────────────┬──────────┘
                                 │              │
                ┌────────────────▼───┐   ┌──────▼─────────────┐
                │ Supabase Postgres  │   │ S3 + CloudFront    │
                │  RLS: tenant_id    │   │  exercise media    │
                │       + user_id    │   │  tenant logos      │
                └────────────────────┘   └────────────────────┘

  Shared, framework-free, 100% unit-tested:
  packages/training-core/   ← progression, 1RM, volume, session read-back
    imported by BOTH apps/api (authoritative) and apps/web (optimistic UI)
```

### 3.1 Non-negotiable architectural decisions

**ADR-0001 — Extract `packages/training-core`.**
**ADR-0002 — Shared-schema multi-tenancy with `tenant_id` + RLS.**
**ADR-0003 — Monorepo via npm workspaces.**
**ADR-0004 — Offline-first write path.**
**ADR-0005 — The API never trusts the client for training state.**

---

## 4. Data model

### 00_tenancy.sql

```sql
create type app_role as enum ('owner','manager','trainer','member');

create table tenants (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  country       char(2) not null default 'LK',
  timezone      text not null default 'Asia/Colombo',
  unit_system   text not null default 'kg' check (unit_system in ('kg','lb')),
  branding      jsonb not null default '{}',
  plan_tier     text not null default 'trial',
  status        text not null default 'active',
  created_at    timestamptz not null default now()
);

create table memberships (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          app_role not null default 'member',
  status        text not null default 'active',
  joined_at     date not null default current_date,
  expires_at    date,
  unique (tenant_id, user_id)
);
create index on memberships (tenant_id, role, status);

create or replace function current_tenant_id() returns uuid
language sql stable as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'tenant_id', '')::uuid
$$;

create or replace function current_role_in_tenant() returns app_role
language sql stable as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'role', 'member')::app_role
$$;
```

### 01_catalogue.sql (exercise library)

```sql
create table exercises (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references tenants(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  slug          text not null,
  name          text not null,
  body_part     text not null,
  primary_muscles   text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  equipment     text[] not null default '{}',
  media_url     text,
  instructions  jsonb default '{}',
  is_bodyweight boolean not null default false,
  is_assisted   boolean not null default false,
  is_timed      boolean not null default false,
  is_cardio     boolean not null default false,
  is_per_side   boolean not null default false,
  default_increment_kg numeric(5,2) default 2.5,
  bar_weight_kg numeric(5,2),
  created_at    timestamptz not null default now(),
  unique nulls not distinct (tenant_id, owner_user_id, slug)
);
create index on exercises using gin (primary_muscles);
create index on exercises using gin (equipment);

create table exercise_favourites (
  user_id     uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  primary key (user_id, exercise_id)
);
```

### 02_training.sql

```sql
create type progression_rule as enum
  ('linear','greyskull','double','time','none');

create table routines (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references tenants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  position      int  not null default 0,
  default_rule  progression_rule not null default 'linear',
  created_at    timestamptz not null default now()
);

create table routine_items (
  id             uuid primary key default gen_random_uuid(),
  routine_id     uuid not null references routines(id) on delete cascade,
  exercise_id    uuid not null references exercises(id),
  position       int  not null,
  superset_group int,
  target_sets    int  not null default 3,
  target_reps_min int,
  target_reps_max int,
  target_seconds int,
  rule_override  progression_rule,
  increment_kg   numeric(5,2),
  rest_seconds   int default 120
);

create table week_schedule (
  user_id    uuid not null references auth.users(id) on delete cascade,
  weekday    int  not null check (weekday between 0 and 6),
  routine_id uuid references routines(id) on delete set null,
  primary key (user_id, weekday)
);

create table workouts (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references tenants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  routine_id    uuid references routines(id) on delete set null,
  name          text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  body_weight_kg numeric(5,2),
  total_volume_kg numeric(10,2),
  source        text not null default 'app',
  client_id     text,
  unique nulls not distinct (user_id, client_id)
);

create table workout_sets (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references workouts(id) on delete cascade,
  exercise_id   uuid not null references exercises(id),
  set_index     int  not null,
  kind          text not null default 'working'
                check (kind in ('warmup','working','drop','burst')),
  weight_kg     numeric(6,2),
  reps          int,
  seconds       int,
  speed_kmh     numeric(5,2),
  effort_value  numeric(3,1),
  effort_scale  text check (effort_scale in ('rir','rpe')),
  is_pr         boolean not null default false,
  logged_at     timestamptz not null default now()
);
create index on workout_sets (exercise_id, logged_at desc);

create table body_weight_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  measured_on date not null,
  weight_kg  numeric(5,2) not null,
  unique (user_id, measured_on)
);
```

### 03_gym_ops.sql (the part you sell)

```sql
create table membership_plans (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  name         text not null,
  price_cents  int  not null,
  currency     char(3) not null default 'LKR',
  duration_days int not null,
  is_active    boolean not null default true
);

create table member_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan_id       uuid not null references membership_plans(id),
  starts_on     date not null,
  ends_on       date not null,
  status        text not null default 'active',
  payment_ref   text
);
create index on member_subscriptions (tenant_id, ends_on);

create table check_ins (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  method     text not null default 'qr' check (method in ('qr','pin','manual')),
  checked_in_at timestamptz not null default now()
);
create index on check_ins (tenant_id, checked_in_at desc);

create table classes (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  trainer_id  uuid references auth.users(id) on delete set null,
  title       text not null,
  starts_at   timestamptz not null,
  duration_min int not null default 60,
  capacity    int not null default 20,
  status      text not null default 'scheduled'
);

create table class_bookings (
  id        uuid primary key default gen_random_uuid(),
  class_id  uuid not null references classes(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  state     text not null default 'booked'
            check (state in ('booked','waitlisted','attended','no_show','cancelled')),
  booked_at timestamptz not null default now(),
  unique (class_id, user_id)
);

create table audit_log (
  id         bigserial primary key,
  tenant_id  uuid references tenants(id) on delete cascade,
  actor_id   uuid references auth.users(id) on delete set null,
  action     text not null,
  target     text,
  metadata   jsonb not null default '{}',
  ip         inet,
  created_at timestamptz not null default now()
);
create index on audit_log (tenant_id, created_at desc);
```

### 04_rls.sql

```sql
alter table workouts enable row level security;

create policy workouts_member_rw on workouts
  for all to authenticated
  using      (user_id = auth.uid() and tenant_id is not distinct from current_tenant_id())
  with check (user_id = auth.uid() and tenant_id is not distinct from current_tenant_id());

create policy workouts_staff_read on workouts
  for select to authenticated
  using (tenant_id = current_tenant_id()
         and current_role_in_tenant() in ('owner','manager','trainer'));
```

---

## 5. API surface (v1)

```
POST   /v1/auth/switch-tenant
GET    /v1/exercises?q=&equipment=&muscle=&favourites=
POST   /v1/exercises
POST   /v1/exercises/:id/favourite
GET    /v1/routines
POST   /v1/routines
PATCH  /v1/routines/:id
PUT    /v1/schedule
POST   /v1/schedule/reschedule
POST   /v1/workouts
POST   /v1/workouts/:id/sets
POST   /v1/workouts/:id/finish
GET    /v1/workouts/:id/targets
GET    /v1/stats/heatmap?year=
GET    /v1/stats/muscle-map?window=30d
GET    /v1/stats/strength/:exerciseId
GET    /v1/body-weight | POST /v1/body-weight
POST   /v1/coach/plan
POST   /v1/coach/review
GET    /v1/gym/members
POST   /v1/gym/members/:id/subscription
POST   /v1/gym/check-in
GET    /v1/gym/classes | POST /v1/gym/classes
POST   /v1/gym/classes/:id/book
GET    /v1/gym/analytics/retention
GET    /v1/gym/audit-log
```

**Cross-cutting middleware (build once, F00):**
`requireAuth` → `resolveTenant` → `requireRole(...)` → `rateLimit` → `auditWrite` → handler.

---

## 6. Epics

### F00 — Multi-tenancy foundation 🔴 BLOCKING

**Why first:** every later table needs `tenant_id`. Retrofitting tenancy onto 20 tables is a week you will never get back.

**Scope**
- Migrations `00_tenancy.sql`, `04_rls.sql`
- JWT custom claims: Supabase Auth Hook injecting `app_metadata.tenant_id` and `.role` on token issue
- `POST /v1/auth/switch-tenant` for users belonging to multiple gyms
- Express middleware chain: `requireAuth`, `resolveTenant`, `requireRole`
- Backfill: existing single-user rows → `tenant_id = NULL` (Personal edition)

**Acceptance criteria**
1. A member JWT for tenant A selecting tenant B's `workouts` returns **0 rows**.
2. A `trainer` can read members' workouts in their own tenant and write none.
3. `tenant_id IS NULL` rows remain visible to their owner (Personal edition unaffected).
4. Role escalation attempt via client-supplied header is ignored — role comes from the signed JWT only.

**Definition of Done**
```bash
cd apps/api && npm test -- tenancy
npx supabase db reset && npm run test:rls
```

### F01–F23 — (See full spec for remaining epics)

### F24 — CI/CD & infrastructure rework
(See full spec)

---

## 7–13. (See full spec for milestones, risk register, DoD, AGENTS.md, skills, workflows, and first commands)

---

## Appendix A — Personal vs Gym Pro feature gating

```ts
export const ENTITLEMENTS = {
  personal: ['training', 'analytics', 'export', 'pwa'],
  gym_trial: ['training', 'analytics', 'export', 'pwa',
              'members', 'checkin', 'classes'],
  gym_pro:   ['training', 'analytics', 'export', 'pwa',
              'members', 'checkin', 'classes', 'branding',
              'payments', 'trainers', 'owner_analytics', 'coach'],
} as const;
```

Gate on the **server**. A hidden UI button is not access control.
