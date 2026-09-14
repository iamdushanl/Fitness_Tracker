# SPEC.md — FitTrack Personal Fitness Tracker

> **What the product is and why it exists.** This document captures product requirements, user goals, success criteria, and architectural decisions. It does **not** describe implementation code; it describes intent. Status markers reflect the live system as of September 2026.

---

## 1. One-line summary

An adaptive fitness web app that creates personalized 7-day workout schedules from a user's physical profile and fitness goal, tracks their actual performance, and automatically adjusts future workout targets based on their weekly completion rate.

---

## 2. The people (users)

**Primary user:** A person who wants to achieve a specific fitness goal through a structured training plan but needs guided programming and adaptive progression based on their real-world performance.

**What they need:**
1. Receive a workout schedule appropriate for their goal and current ability.
2. Know exactly how to perform each exercise — step-by-step text instructions plus an embedded video demo.
3. Record what they actually completed, even when it differs from the plan.
4. See clearly whether they are making progress toward their target.
5. Have next week's workouts automatically adjusted to match their actual pace.

**What would make them stop using it:**
1. The schedule feels random, too hard, or irrelevant to their goal.
2. Exercise instructions are unclear or the video fails to load.
3. The system does not adapt when they repeatedly struggle to complete workouts.
4. The app does not acknowledge their progress or effort.
5. Logging a workout feels like a chore rather than a quick check.

---

## 3. Core features (v1)

| # | Feature | Status |
|---|---|---|
| 1 | **Personalized workout planning** — Static lookup table keyed on `(fitness_goal, experience_level)` (4 × 3 = 12 templates), generating a 7-day plan per user | ✅ Live |
| 2 | **Workout completion tracking** — Record sets × reps × weight (strength) or duration × distance (cardio); compare against prescribed targets | ✅ Live |
| 3 | **Exercise guidance** — Text instructions and embedded YouTube demo for each of 20 seeded exercises | ✅ Live |
| 4 | **Progress monitoring** — Daily workout streak, weekly completion-rate trend, current weight vs. starting weight | ✅ Live |
| 5 | **Adaptive workout scheduling** — Rule-based ±10% heuristic adjusts targets each week (see §5a) | ✅ Logic built — Sunday cron pending |
| 6 | **Google OAuth sign-in** — One-click Google login via Supabase Auth; unauthenticated visitors see a public landing page | ✅ Live |

---

## 4. Non-goals (out of scope for v1)

- Camera-based exercise form analysis
- Live personal trainer / human coaching
- Wearable device integration (Apple Watch, Garmin, Fitbit, etc.)
- Food, nutrition, or calorie tracking
- AI / ML-based plan generation (v1 uses static lookup tables)
- Periodization, deload cycles, or advanced progressive-overload programming
- Self-hosted exercise videos (v1 links to YouTube)
- Unit system toggle — v1 is **metric-only** (cm / kg)
- Multiple concurrent active training plans per user
- Social features (sharing, leaderboards, challenges)

---

## 5. The data

### User profile
`name`, `age`, `height_cm`, `weight_kg`, `experience_level`, `fitness_goal`

### Fitness Goal (enum)
`weight_loss` · `muscle_gain` · `general_fitness` · `endurance`

### Experience Level (enum)
`beginner` · `intermediate` · `advanced`

### Exercise seed library (20 exercises, shared read-only)
- **10 strength** — Barbell Squat, Bench Press, Deadlift, Overhead Press, Barbell Row, Lunge, Bicep Curl, Tricep Extension, Plank, Lat Pulldown
- **6 cardio** — Running, Cycling, Jump Rope, Rowing, Stair Climbing, Brisk Walking
- **4 flexibility** — Hamstring Stretch, Hip Flexor Stretch, Shoulder Stretch, Cat-Cow
- Each exercise has: `name`, `category`, `muscle_group`, manually-written `instructions`, curated `youtube_url`
- Exercises use deterministic UUIDs (`00000000-0000-0000-0000-00000000000N`) for reliable cross-environment plan generation

### Workout Plan
A weekly schedule (`week_start_date` → `week_end_date`) of plan exercises with prescribed targets. Each plan exercise stores both **current** targets (adapted week-over-week) and immutable **initial** targets (`initial_target_*`) for guardrail enforcement.

### Workout Log
Per-exercise actual results: `actual_sets`, `actual_reps`, `actual_weight_kg`, `actual_duration_min`, `actual_distance_km`, `performed_at`, optional `notes`. Logs are the source of truth for all progress computations.

### Progress Snapshot (computed, not stored)
- **Daily streak** — consecutive days (ending at today or yesterday) with ≥ 1 logged workout; computed server-side by `GET /summary/week`
- **Weekly completion rate** — percentage of prescribed volume actually completed in the current week
- **Weight trend** — `weight_history` entries ordered by `recorded_at`; current vs. starting weight

---

### 5a. Adaptation rules (v1 heuristic)

The system recalculates next week's plan every **Sunday at 23:00 UTC** (or on-demand via `POST /plans/adapt`):

| Completion Rate | Action |
|---|---|
| ≥ 90% | Increase next week's targets by 10% |
| 60–89% | Keep targets the same |
| 30–59% | Decrease next week's targets by 10% |
| < 30% **or** 0 logged workouts | Keep current targets; show encouragement nudge |

**Guardrails:**
- Targets never exceed **1.5×** the `initial_target_*` baseline (written to `plan_exercises` at creation time)
- Targets never fall below **0.5×** the `initial_target_*` baseline
- After **3 consecutive weeks** below 30% completion, the system prompts the user to review their goal or profile

> This heuristic is intentionally simple and demoable. Periodization and deload weeks are v2.

---

## 6. Sign-in

Google (Gmail) OAuth via **Supabase Auth** (`@supabase/supabase-js`).

**What a signed-out visitor can see:**
- Public landing page (`<Landing />`) with hero section, feature cards, and "Sign in with Google" CTA
- No private data, workouts, logs, or profile information is exposed or queryable

**What is private to the authenticated user:**
- User profile and physical metrics (`users` table)
- Workout plans and scheduled exercises (`workout_plans`, `plan_exercises`)
- Historical workout performance logs (`workout_logs`) and weigh-in trends (`weight_history`)
- Server-computed weekly completion metrics and daily streak

**Session handling:**
- Session is seeded from `localStorage` on first load — no flash of unauthenticated content
- `AuthContext` subscribes to `supabase.auth.onAuthStateChange` — no polling, no duplicate listeners
- All protected routes render only after the auth session resolves (`loading` guard in `AppShell`)

---

## 7. Key user journeys

### Journey 1 — Create my workout plan
```
Sign in with Google
→ Land on Dashboard (no active plan → "Create Plan" CTA is prominent)
→ Navigate to /create-plan
→ Enter name, age, height (cm), weight (kg)
→ Select experience level (beginner / intermediate / advanced)
→ Select fitness goal (weight loss / muscle gain / general fitness / endurance)
→ Submit → System matches the 12-template lookup table
→ Inserts: users profile, weight_history record, workout_plans row,
   plan_exercises rows (with initial_target_* baselines stored at creation)
→ Displays the 7-day schedule with prescribed exercises and targets
```

### Journey 2 — Complete and record a workout
```
Open Workout screen (/workout)
→ DaySelector shows Mon–Sun of the current week
→ Select today → list of prescribed exercises with targets
→ Click an exercise → ExerciseDetails (/exercise/:id)
   → Read step-by-step text instructions
   → Watch embedded YouTube demonstration (direct link fallback for ad-blockers)
→ Back to Workout screen → click "Log"
→ WorkoutLogForm: enter actual sets × reps × weight OR duration × distance
→ Save → persisted to workout_logs via Supabase direct client
→ Exercise card shows green ✓ badge and actual values logged
→ Dashboard and Progress screens reflect the update
```

### Journey 3 — Monitor progress and get next week's plan
```
Open Progress screen (/progress)
→ CompletionChart shows weekly completion % history
→ WeightChart shows weigh-in trend line
→ StreakCard shows current daily streak count
→ (End of week) Backend evaluates completion rate via adaptation heuristic
→ Creates new workout_plans + plan_exercises rows for next week
→ Dashboard shows updated schedule with adapted targets
→ NudgeBanner explains the change ("Targets increased 10%!" or encouragement)
```

---

## 8. Success criteria

### Implemented ✅
- [x] Enter profile, select level and goal → receive a 7-day workout schedule
- [x] Record actual sets × reps × weight (or duration × distance), including values that differ from the plan; records persist after page refresh
- [x] View workout history, weekly completion-rate trend, and current daily streak
- [x] Access text instructions and YouTube video for each scheduled exercise
- [x] RLS enforced — a second signed-in user cannot see or modify another user's records
- [x] Invalid profile input (height = 0, weight = -5) shows a validation error and is not saved
- [x] Backend `/health` returns `{"status":"ok"}` live on AWS ECS
- [x] Backend `/summary/week` returns `daily_streak`, `total_minutes`, `workouts_this_week`, and `total_workouts_logged` for the authenticated user
- [x] CORS preflight from the Vercel origin returns `204 No Content` with `Access-Control-Allow-Origin` — frontend and backend communicate correctly in production
- [x] GitOps CD: push to `backend/**` on `main` → auto-build Docker image → push to ECR → force-deploy ECS

### Pending ⬜
- [ ] Automated Sunday 23:00 UTC adaptation cron applies ±10% targets (0.5×–1.5× guardrails)
- [ ] 3-consecutive-week miss nudge triggers in-app goal-review prompt
- [ ] Progress screen wired to `GET /progress/summary` for server-authoritative multi-week history

---

## 9. Decisions made along the way

1. **Google OAuth via Supabase Auth** — Unified `AuthContext` with `onAuthStateChange` listener and `localStorage` session caching. `AppShell` pattern serves `<Landing />` to unauthenticated users and protected routes to authenticated ones — no redirect roundtrips.
2. **Direct Supabase RLS client for CRUD; backend for trusted calculations** — Client reads/writes go directly to Supabase under strict `auth.uid() = user_id` RLS policies. Streak and completion logic runs server-side with the admin client to prevent manipulation.
3. **Immutable `initial_target_*` columns on `plan_exercises`** — Written once at plan creation; enables self-contained 0.5×–1.5× guardrail checks without re-reading static templates. Decoupled from future template revisions.
4. **Static 12-template lookup table (not DB rows)** — V1 uses a fixed pre-authored grid; avoids DB complexity for configuration that requires no per-user customization.
5. **`weight_history` as a separate table** — Enables weight-trend chart and preserves starting weight without extra columns; `users.weight_kg` is synced for quick current-weight reads.
6. **Metric-first design (cm / kg)** — Consistent across all volume calculations; avoids unit-conversion rounding bugs in early schemas. Imperial toggle is v2.
7. **Native Node.js test runner** — Zero external dependencies; < 100 ms cold start for a lightweight microservice.
8. **Modular `frontend/src/lib/` data layer** — Pure query functions keep UI components focused on presentation; enables clean error boundaries.
9. **Multi-stage Dockerfile with non-root `node` user** — Minimal production image size; non-root execution is a container security requirement for ECS.
10. **Comma-separated `CORS_ORIGIN` env var** — Allows `https://app.vercel.app,http://localhost:5173` without code changes across environments.
11. **GitOps CD via GitHub Actions** — Every push to `backend/**` on `main` auto-builds a `linux/amd64` image, pushes to ECR (`:sha` + `:latest`), and force-deploys ECS — no manual container management.
12. **Streak algorithm parity (client + server)** — Identical algorithm in `frontend/src/lib/streak.js` and `backend/utils/streak.js`; both unit-tested. Server result is authoritative.

---

## 10. Open questions & risks

**Resolved:**
- ~~Initial workout schedule?~~ → Static 12-template lookup on `(fitness_goal, experience_level)`
- ~~When/how to adjust targets?~~ → Weekly completion rate heuristic with ±10% and 0.5×–1.5× guardrails
- ~~Exercise video delivery?~~ → Curated YouTube embeds with direct fallback links
- ~~Unauthenticated user experience?~~ → `<Landing />` with Google OAuth CTA
- ~~Reliable streak calculation?~~ → Identical unit-tested algorithm on client and server
- ~~Backend deployment?~~ → Docker → ECR → ECS; auto-redeployed by GitHub Actions on every backend push
- ~~Frontend → backend communication in production?~~ → `VITE_API_URL` in Vercel; CORS origin allowlist on ECS

**Remaining for v2:**
- Periodization and deload weeks for advanced trainees
- Manual exercise substitution within an existing plan
- Historical multi-plan archive with a week selector
- Unit system toggle (Imperial lbs/inches vs. Metric kg/cm)
- Sunday-night automated adaptation cron via AWS EventBridge
- `GET /progress/summary` wired to the Progress screen
- Manual exercise substitution / swap within an existing plan.
- Unit system toggle (Imperial lbs/inches vs. Metric kg/cm).
