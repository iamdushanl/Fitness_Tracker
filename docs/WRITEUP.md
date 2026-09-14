# FitTrack — Project Reflection

> A spec-driven, cloud-deployed adaptive fitness tracker built over 11 weeks.
> This is what I actually built, what broke, what I'd change, and what I learned.

---

## Overview

FitTrack is a full-stack web app that generates personalized weekly workout plans, lets users log what they actually completed, and automatically adapts next week's targets based on their performance. Users sign in with Google, get a 7-day schedule tailored to their goal and experience level, and see their streak and progress update in real time.

The final stack:

- **Frontend** — React + Vite, deployed on Vercel
- **Backend** — Node.js + Express 5, containerized in Docker, deployed on AWS ECS (Fargate)
- **Database & Auth** — Supabase (PostgreSQL + Google OAuth)
- **CI/CD** — GitHub Actions: lint → build → push ECR → force-deploy ECS

The app is live right now:

- Frontend: [https://fitness-tracker-xi-eosin.vercel.app](https://fitness-tracker-xi-eosin.vercel.app)
- Backend: `https://fi-86eb39c4d24d48df9757700cee848968.ecs.us-east-1.on.aws`

---

## What I Built

The core loop is:

1. **Onboard** — enter your age, height, weight, experience level, and fitness goal
2. **Plan** — the system picks one of 12 pre-authored templates (4 goals × 3 levels) and generates a 7-day schedule of exercises with specific prescribed sets, reps, weight, duration, or distance
3. **Do** — open the Workout screen, read the instructions and watch the YouTube demo, log your actual results
4. **Adapt** — at the end of the week, the backend compares what you planned vs. what you did and adjusts next week's targets ±10%, within a 0.5×–1.5× guardrail based on your original plan

The data model has six PostgreSQL tables (`users`, `weight_history`, `workout_plans`, `plan_exercises`, `exercises`, `workout_logs`). Row-Level Security policies enforce tenant isolation — a signed-in user can only ever read or write their own rows.

The backend owns the logic that shouldn't live in the browser: the streak calculation, the weekly volume summary, and the adaptation heuristic. The frontend owns the UI: forms, charts, navigation, and rendering.

---

## The Engineering Journey

### 1. Specification

I wrote `SPEC.md` before writing a single line of code. That felt backward at first — I wanted to start building — but it turned out to be the most valuable constraint of the project.

The spec forced me to answer questions I would have deferred: What does "streak" mean exactly — days or weeks? What happens when someone logs zero workouts? What does an unauthenticated user see? What's out of scope?

By the time I started building, I knew the answer to those questions. When I hit edge cases later (and I did), I didn't have to make it up on the spot — I could go back to the spec and either find the answer or explicitly update it.

The spec also kept me from scope-creeping. "Nutrition tracking" and "wearable sync" got marked as non-goals on Day 1. That clarity saved weeks.

### 2. Architecture

Writing `ARCH.md` before building revealed a decision I hadn't consciously made: which logic belongs on the server vs. the client?

The answer I landed on: **anything that determines the user's future workout targets lives on the server.** Streak counts, completion rates, adaptation heuristics — all of it runs in Node.js, verified with the Supabase admin client. The client can display an optimistic streak value computed locally, but the authoritative number comes from `GET /summary/week`.

The key data model decision was the `initial_target_*` columns on `plan_exercises`. When a plan is generated, the original prescribed values are written once and never changed. The `target_*` columns adapt weekly; the `initial_target_*` columns are the guardrail reference. This made the 0.5×–1.5× adaptation check a trivially simple same-row comparison, without coupling the adaptation logic to the static template config.

### 3. AI-Assisted Development

I used an AI coding assistant throughout the project. It was genuinely useful for scaffolding boilerplate, writing SQL RLS policies, explaining AWS permission errors, and catching bugs in the streak algorithm.

It was less useful — and sometimes actively misleading — in two specific ways:

1. **It generates confident-sounding code that doesn't reflect the actual state of the system.** Early AI-suggested docs described the `/summary/week` endpoint returning a `"placeholder"` response with `streak_weeks: 0`. The real endpoint was already returning live data. The docs were wrong; the code was right. I had to audit everything.

2. **It defaults to the most popular answer, not the right one.** When I asked how to deploy my backend, the first suggestion was always AWS App Runner. App Runner is fine for demos. But I needed ECS-level task-definition control for secrets injection via Secrets Manager. The AI kept coming back to App Runner until I explicitly pushed back with my actual requirements.

The honest summary: AI pair programming is genuinely accelerating. But you have to stay in the driver's seat. The moment you stop reading and start just accepting, you lose the thread.

### 4. CI/CD

The GitHub Actions pipeline was the piece I was most nervous about and most satisfied with when it worked.

The `deploy-backend` job does five things on every push to `main` that touches `backend/**`:

1. Configures AWS credentials from GitHub Secrets
2. Logs in to Amazon ECR
3. Builds a `linux/amd64` Docker image (explicitly — I'm developing on ARM and ECS runs x86)
4. Pushes tagged with the git SHA and `:latest`
5. Calls `aws ecs update-service --force-new-deployment`

The moment I pushed a backend change and watched the ECS task cycle automatically — without touching the AWS console — felt like a significant shift in how I think about deployment. The git history _is_ the deployment history.

One gotcha that cost me 20 minutes: GitHub Secret names cannot contain spaces. I was copy-pasting from a Markdown table and the name field was picking up leading spaces. The error message was clear once I read it carefully.

### 5. Docker

The `backend/Dockerfile` is a two-stage build:

- **Stage 1 (`dependencies`)** — installs only production npm packages and cleans the npm cache
- **Stage 2 (`runner`)** — copies the node_modules from Stage 1, copies the source, runs as the non-root `node` user

The `USER node` line matters. Running containers as root is a security anti-pattern — it means a process breakout gives an attacker root on the host. `node:22-alpine` ships with a `node` user at UID 1000; using it costs nothing and is the right default.

The `HEALTHCHECK` directive lets ECS verify the container is actually serving traffic before marking it healthy:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1
```

One platform trap: building on Apple Silicon without `--platform linux/amd64` produces an ARM image that runs locally but silently fails on ECS. The GitHub Actions workflow always specifies `--platform linux/amd64`, which is why the pipeline produces correct images even if a local build might not.

### 6. AWS Deployment

The architecture is:

- **Amazon ECR** stores the Docker images
- **AWS ECS** (Fargate, no EC2 to manage) runs the container
- **ECS Task Definition** injects environment variables (`CORS_ORIGIN`, `NODE_ENV`, `SUPABASE_URL`)
- The backend has a **public HTTPS URL** via the ECS service's load-balanced endpoint

One design decision I'm glad I made: the `CORS_ORIGIN` environment variable accepts a comma-separated list of origins. In development it's `*`. In production it's `https://fitness-tracker-xi-eosin.vercel.app,http://localhost:5173`. One variable, no code changes across environments.

Verifying the deployment:

```bash
# Health check
curl https://fi-86eb39c4d24d48df9757700cee848968.ecs.us-east-1.on.aws/health
# → {"status":"ok"}

# CORS preflight from the Vercel origin
curl -I -X OPTIONS \
  https://fi-86eb39c4d24d48df9757700cee848968.ecs.us-east-1.on.aws/summary/week \
  -H "Origin: https://fitness-tracker-xi-eosin.vercel.app"
# → HTTP/1.1 204 No Content
#   Access-Control-Allow-Origin: *
```

Both pass. Frontend and backend talk to each other in production.

---

## The Hardest Bug

The streak algorithm.

The problem: "streak" is ambiguous. If I last worked out yesterday, is my streak broken or still active? It should be active — I haven't missed a day yet, today just hasn't happened. But naive implementations either count yesterday as a broken streak (wrong) or allow the streak to keep growing indefinitely even if the user never comes back (also wrong).

The algorithm I ended up with handles three cases:

1. Workout logged **today** → streak is active, count backward from today
2. No workout today but logged **yesterday** → streak is still live (today is just early), count backward from yesterday
3. Most recent workout was 2+ days ago → streak is 0

The trickier part: this logic lives in **two places**. The client computes an optimistic value using `frontend/src/lib/streak.js` so the dashboard feels instant. The server computes the authoritative value in `backend/utils/streak.js`. If those two algorithms diverge, the user sees their streak change when the server responds — which looks like a bug even when it isn't.

My solution: the two implementations are deliberately kept identical, and both are unit-tested. Any future change to the streak logic has to pass tests in both places. This is a forcing function: you can't silently drift.

The test suite in `backend/tests/streak.test.js` covers five cases: empty input, worked out only today, 3-day streak including today, 3-day streak without today (yesterday was the last day), and a broken streak (last workout 2+ days ago). Using the native `node --test` runner means zero additional dependencies.

---

## What AI Got Wrong

Several things, and I think being specific about them is more useful than a vague disclaimer.

**1. The API response shape.** Early AI-generated documentation described the `/summary/week` endpoint returning:

```json
{
  "status": "placeholder",
  "message": "Will compute trusted weekly volume...",
  "data": { "completion_rate": 0, "streak_weeks": 0 }
}
```

This was the planned shape from early in the project. The AI had been trained on earlier context. The actual live endpoint returns:

```json
{
  "user_id": "...",
  "week_start_date": "2026-09-08",
  "total_minutes": 142,
  "daily_streak": 4,
  "workouts_this_week": 5,
  "total_workouts_logged": 23
}
```

Completely different. No `status` wrapper, no `streak_weeks` (it's `daily_streak`), no placeholder. The AI confidently described the old shape because that's what it had seen. Docs that the AI writes from memory need to be verified against the actual code.

**2. Streak granularity.** The AI initially described the streak as "consecutive weeks with ≥ 1 logged workout." The spec and the code both use **daily** granularity. This matters — a user who works out 5 days straight has a 5-day streak, not a 1-week streak. The AI conflated "weekly workout plan" with "weekly streak" and produced a spec and docs that were internally inconsistent with the implementation.

**3. AWS service selection.** As noted above — App Runner kept being suggested when the requirements called for ECS. The AI optimizes for "common case" defaults, which are not always right.

---

## A Technical Decision I'd Change

**Plan generation should be fully server-side from the start.**

Right now, when a user creates a plan, the 12-template lookup and `plan_exercises` insertion happen in `frontend/src/lib/plans.js` — client-side code that calls Supabase directly. The backend's `/plans/generate` endpoint is planned but not yet built.

This happened for a practical reason: the frontend came first, I needed a working plan-creation flow, and direct Supabase access from the client was the fastest path. RLS protects the data; nothing breaks. But now the "trusted server handles adaptation" architecture has a gap: plan generation, which is the most logic-heavy operation in the system, runs in the browser.

The consequence is subtle but real. If I ever want to change the template logic — adjust sets, add new exercises, change the level multipliers — I have to ship a new frontend build and redeploy Vercel. That's a frontend deployment for what is fundamentally backend configuration. If it were on the server, it would be a backend deployment only.

In V2, plan generation moves to `POST /plans/generate`, the frontend just calls the endpoint, and the template logic is fully owned by the server.

---

## What I Learned

**1. Specs prevent regret.** Every time I was tempted to skip writing a spec section, I paid for it later with a conversation about scope. Every time I wrote it first, I had something to point to when someone asked "why did you do it that way?"

**2. Twelve templates is not twelve files.** The workout template system looks large — 4 fitness goals × 3 experience levels — but it's implemented as a single `buildWeeklyScheduleTemplate(goal, level, dates)` function with multipliers. `beginner` gets `setDelta = -1` and `weightMult = 0.75`. `advanced` gets `+1` and `1.25`. The whole system is ~170 lines. The apparent complexity was configuration, not code.

**3. CORS is a browser concept, not a server concept.** The server doesn't enforce CORS — the browser does. The server adds `Access-Control-Allow-Origin` headers; the browser decides whether to honor them. This matters for debugging: `curl` will always work regardless of CORS headers, because `curl` is not a browser. If CORS is broken, you'll see it in a browser DevTools network tab, not in a terminal.

**4. `linux/amd64` is not optional on Apple Silicon.** If you develop on M1/M2/M3 and deploy to x86 infrastructure, you must explicitly specify `--platform linux/amd64` in your Docker build. The image will build without it. It will also run locally without it. It will silently behave incorrectly or fail on ECS. This is a trap that is easy to fall into and annoying to debug.

**5. Read the error message.** GitHub Actions rejected my secrets because the names had leading spaces (copy-pasted from a Markdown table). The error said exactly that: "Secret names can only contain alphanumeric characters... Spaces are not allowed." I spent five minutes confused before I actually read the error. Reading error messages carefully is a skill that compounds.

---

## What I'd Build in V2

**1. `POST /plans/generate` on the backend** — move template logic fully server-side, as discussed above.

**2. `GET /progress/summary`** — the Progress screen currently computes history client-side. A server endpoint would aggregate multi-plan completion history and provide authoritative weekly trend data without shipping raw logs to the browser.

**3. Sunday 23:00 UTC cron** — the adaptation heuristic is built but not automated. An AWS EventBridge rule triggering the `POST /plans/adapt` logic weekly would complete the "adaptive scheduling" core feature.

**4. Exercise substitution** — let users swap an exercise they can't do for a similar one in the same category. The seed library has the data; it needs a UI and a server-side substitution mapping.

**5. Imperial units toggle** — deliberately out of scope for V1 to avoid rounding bugs in the schema. In V2, store a `unit_preference` on the `users` table and convert at display time only. Never store Imperial values in the database.

**6. Historical plan archive** — V1 always loads the most recent plan. V2 should let users navigate their past training blocks and see progression over months, not just weeks.

---

## Final Architecture

```
Browser (Vercel)
│
├── React 19 + Vite SPA
│   ├── AuthContext  ──── Supabase Auth (Google OAuth)
│   │                       ↕ JWT session (localStorage)
│   ├── Direct Supabase client (RLS-protected reads/writes)
│   │   └── users, weight_history, workout_plans, plan_exercises,
│   │       exercises, workout_logs
│   │
│   └── fetch() → AWS ECS Backend
│       └── Authorization: Bearer <supabase_jwt>
│
AWS ECS (Fargate) — us-east-1
│
└── Node.js + Express 5 container
    ├── GET /health           (public liveness probe)
    ├── GET /summary/week     (requireAuth → supabaseAdmin)
    │   └── calculateDailyStreak() from utils/streak.js
    │       returns: daily_streak, total_minutes, workouts_this_week
    └── [planned] POST /plans/generate, POST /plans/adapt, GET /progress/summary

Supabase (cloud)
├── PostgreSQL (6 tables, RLS on all)
│   └── exercises (seed, read-only) | users | weight_history
│       workout_plans | plan_exercises | workout_logs
└── Auth (Google OAuth provider, JWT issuance)

GitHub Actions (.github/workflows/ci.yml)
├── frontend-ci: lint (OxLint) → build (Vite)  [on: frontend/** push]
└── deploy-backend:                              [on: backend/** push to main]
    ECR login → docker build linux/amd64
    → push :sha + :latest → ecs update-service --force-new-deployment
```

---

## Project Links

| Resource                      | Link                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Live App**                  | [https://fitness-tracker-xi-eosin.vercel.app](https://fitness-tracker-xi-eosin.vercel.app)             |
| **Backend API**               | `https://fi-86eb39c4d24d48df9757700cee848968.ecs.us-east-1.on.aws`                                     |
| **GitHub Repository**         | [github.com/iamdushanl/fitness-tracker-starter](https://github.com/iamdushanl/fitness-tracker-starter) |
| **Product Spec**              | [`docs/SPEC.md`](./SPEC.md)                                                                            |
| **Architecture**              | [`docs/ARCH.md`](./ARCH.md)                                                                            |
| **Known Issues & Roadmap**    | [`docs/KNOWN-ISSUES.md`](./KNOWN-ISSUES.md)                                                            |
| **Database Schema & RLS**     | [`docs/supabase_setup.sql`](./supabase_setup.sql)                                                      |
| **Secrets & Config Standard** | [`docs/CONFIG_AND_SECRETS.md`](./CONFIG_AND_SECRETS.md)                                                |
