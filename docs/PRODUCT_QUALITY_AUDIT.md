# FitTrack 2.0 — Product Quality Audit

> **Audit type**: Read-only static analysis (code inspection, no runtime test execution)
> **Date**: 2026-10-18
> **Scope**: `frontend/src/` — all pages, components, and library modules
> **Not in scope**: Supabase schema, backend routes, database records

---

## Executive Summary

The FitTrack 2.0 frontend is architecturally sound and implements most core flows correctly. However, seven distinct defect clusters exist — from critical auth-flow breakage to cosmetic-level data inconsistencies. **Three P0 blockers** would prevent new users from ever completing a workout. No live runtime testing was performed; all findings are **statically confirmed** from source code.

---

## Priority Legend

| Priority | Definition |
|---|---|
| **P0** | Blocks core user journey end-to-end. Must fix before any release. |
| **P1** | Serious functional defect, misleading data, or broken primary CTA. |
| **P2** | UX friction, cosmetic mis-labelling, inconsistency. |
| **P3** | Nice-to-have improvement, no functional impact. |

---

## P0 — Critical Blockers

### P0-1: Auth forms submit Google OAuth instead of email/password

**File**: `frontend/src/pages/Landing/Landing.jsx` (lines 56-64)

Both the Login and Register forms share `handleSubmit`. When a user fills in email + password and clicks "Sign in" or "Create account", the app ignores the typed credentials completely and launches a Google OAuth redirect. There is no `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()` call anywhere in the file.

**Secondary bug**: "Forgot password?" button (line 191) is also wired to `signInWithGoogle` instead of a password-reset flow.

**Impact**: Email/phone authentication is completely non-functional. All credential attempts silently redirect to Google OAuth.

---

### P0-2: Phone auth tab is a non-functional dead-end

**File**: `frontend/src/pages/Landing/Landing.jsx` (lines 144-153)

The UI shows Email / Phone method tabs. The Phone tab renders a `tel` input, but there is no `supabase.auth.signInWithOtp()` implementation. Submission always calls `signInWithGoogle()`. The Phone tab creates a false expectation and collects input that is never transmitted.

**Impact**: Phone-auth users are silently misled.

---

### P0-3: BrowserRouter is nested conditionally — Landing has no Router context

**File**: `frontend/src/App.jsx` (lines 34-62)

`AppShell` returns `<Landing />` when the user is not authenticated, and only then renders `<BrowserRouter>`. The `Landing` component is therefore rendered outside any React Router context. Any `<Link>` added to Landing would throw a React Router invariant error. The Router is also re-created fresh on every logout/login cycle, resetting all navigation history.

**Correct pattern**: `<BrowserRouter>` should wrap `<AuthProvider>` at the root level in `main.jsx`.

---

## P1 — Serious Functional Defects

### P1-1: Workout "Finish" button requires no sets to be logged

**File**: `frontend/src/pages/Workout/Workout.jsx` (lines 383-392)

The Finish button fires `setSessionFinished(true)` unconditionally. A user can open the Workout page and immediately click "Finish" to see "Outstanding Workout!" with 0 sets logged.

---

### P1-2: Dashboard "Goal pace" completion rate has a unit mismatch

**File**: `frontend/src/pages/Dashboard/Dashboard.jsx` (lines 102-107)

```
completionRate = workoutLogs.length / planExercises.length
```

`workoutLogs` records one row **per set**, while `planExercises` counts distinct exercises. The ratio is meaningless. After one workout day with 4 sets it will exceed 100%.

Same logic is reused in `Progress.jsx` lines 86-89.

---

### P1-3: Dashboard muscle readiness bars are fully hardcoded

**File**: `frontend/src/pages/Dashboard/Dashboard.jsx` (lines 405-421)

Chest 84%, Back 78%, Legs 91% are hardcoded static values. The `Recovery.jsx` page dynamically computes these from workout log timestamps but the Dashboard never uses that computation.

---

### P1-4: Progress "Personal records" metric is fabricated

**File**: `frontend/src/pages/Progress/Progress.jsx` (lines 287-289)

```js
<strong>{workoutLogs.length > 5 ? '7' : '3'}</strong>
<em>3 in last 30 days</em>
```

Personal records count is a hardcoded branch — never computed from actual data. Users with 0 or 200 logs see fabricated numbers (3 or 7). The "3 in last 30 days" subtitle is always static.

---

### P1-5: Performance score is inconsistent across Dashboard and Progress

**File**: `frontend/src/pages/Dashboard/Dashboard.jsx` (line 458)
```js
820 + Math.min(120, loggedExercises * 12)
```
**File**: `frontend/src/pages/Progress/Progress.jsx` (line 206)
```js
<strong>842</strong>
<em>+6.2%</em>
```

Dashboard computes a semi-dynamic score; Progress hardcodes `842` and `+6.2%`. The values will differ for the same user and both are presented as the same metric.

---

### P1-6: ProfileForm fitness goal values don't match Profile page goal options

**File**: `frontend/src/components/ProfileForm/ProfileForm.jsx` (lines 101-106)
Goals submitted by onboarding: `weight_loss`, `muscle_gain`, `general_fitness`, `endurance`

**File**: `frontend/src/pages/Profile/Profile.jsx` (lines 13-18)
Goals shown in Profile edit: `build_strength`, `hypertrophy`, `general_fitness`, `fat_loss`

A user who creates a plan with `muscle_gain` will see `Strength & Conditioning` (the fallback) in their profile view. The goal enum mismatch also means `buildWeeklyScheduleTemplate` in `plans.js` never differentiates between goals — the same push/pull/legs template is returned regardless of the selected goal.

---

### P1-7: "Review workout logs" button takes no action

**File**: `frontend/src/pages/Workout/Workout.jsx` (lines 302-309)

After a session finishes, clicking "Review workout logs" calls `setSessionFinished(false)` — returning to the workout tracker on the same page. It does not navigate to `/progress` where workout logs are actually displayed.

---

### P1-8: Exercise card images reference non-existent public files

**Files**: `frontend/src/pages/Exercises/Exercises.jsx`, `frontend/src/pages/ExerciseDetails/ExerciseDetails.jsx`

Images are mapped to `/images/bench-press.jpg`, `/images/gym-machines.jpg`, `/images/athlete.jpg`. No `frontend/public/images/` directory is present in the workspace. The `onError` handler hides broken images gracefully, but every exercise card displays no image.

---

## P2 — UX & Consistency Issues

| ID | File | Issue |
|---|---|---|
| P2-1 | `Dashboard.jsx:323` | "Open plan" links to `/create-plan` (generator) instead of `/plan` (viewer) — risks destroying existing plan |
| P2-2 | `Recovery.jsx` | Recovery/Volume/Untrained tabs change `activeTab` state but no content changes between tabs |
| P2-3 | `Progress.jsx` | Strength/Volume/Muscles tabs all render identical content; only Weight tab conditionally shows a chart |
| P2-4 | `Exercises.jsx:193` | Filter icon button has no `onClick` handler — appears interactive but does nothing |
| P2-5 | `Profile.jsx:182-207` | Settings rows have ChevronRight icons (tappable affordance) but are plain `<div>` — clicking does nothing |
| P2-6 | `Profile.jsx:158-163` | "Plan active" badge is unconditional — shown even when user has no workout plan |
| P2-7 | `Sidebar.jsx:99-107` | Adaptive coach text is always static regardless of training history or rest days |
| P2-8 | `Dashboard.jsx:145` | Dashboard readiness Ring and Recovery page readiness Ring use different formulas; values will diverge |
| P2-9 | `TrendChart` (both pages) | Chart likely renders a static decorative SVG curve — not driven by user data |
| P2-10 | `ExerciseDetails.jsx:170` | "Kinetic Chain: Compound Movement" is hardcoded for all exercises including running and stretches |
| P2-11 | `Dashboard.jsx:446` | Weight change label says "kg this week" but calculation is `latest - oldest` (lifetime delta) |

---

## P3 — Minor / Polish

| ID | Location | Issue |
|---|---|---|
| P3-1 | `Landing.jsx:95` | "78% Recovery readiness" in landing hero is always hardcoded |
| P3-2 | `Dashboard.jsx:266` | "~45 min" duration is hardcoded; not calculated from exercise/set count |
| P3-3 | `Profile.jsx:231` | "20 Curated Moves" is hardcoded; not queried from DB |
| P3-4 | `Progress.jsx:202` | "up 6.2% over the last 12 weeks" is always a static string |
| P3-5 | `Recovery.jsx` | Body figure CSS classes (`tired`) don't match legend vocabulary (`fatigued`) |
| P3-6 | `BottomNav.jsx:150` | "Plan status: Adaptive Active" is hardcoded in mobile account sheet |
| P3-7 | `Workout.jsx:535` | RIR column always shows `2`; no user adjustment possible |
| P3-8 | `Plan.jsx:163` | "scheduled sessions" count includes rest days in `allDates.length` |

---

## Data Integrity Summary

| Metric | Source | Accurate? |
|---|---|---|
| Streak | `calculateDailyStreak(workoutLogs)` | ✅ Dynamic |
| Readiness (Dashboard Ring) | `74 + streak * 3` | ⚠️ Heuristic, differs from Recovery |
| Readiness (Recovery Ring) | Heuristic from log timestamps | ⚠️ Heuristic only |
| Muscle bars (Dashboard) | Hardcoded 84/78/91% | ❌ Always static |
| Completion rate ("Goal pace") | sets / exercises (unit mismatch) | ❌ Wrong |
| Weight change label | Lifetime delta, labelled "this week" | ⚠️ Misleading label |
| Performance score | Two different formulas on two pages | ❌ Inconsistent |
| Personal records | `logs > 5 ? 7 : 3` | ❌ Fabricated |
| Training volume | `tonnage` or fallback `42.8t` | ⚠️ Fallback is static |
