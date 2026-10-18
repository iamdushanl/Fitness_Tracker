# UI Migration Plan — FitTrack 2.0 into Fitness Tracker

> **Scope**: Read-only analysis. No code has been modified.
> **Date**: 2026-10-17
> **Author**: Antigravity AI (senior frontend architect analysis)

---

## Table of Contents

1. [Current Architecture of Both Projects](#1-current-architecture-of-both-projects)
2. [Component and Page Mapping](#2-component-and-page-mapping)
3. [Dependency and Styling Conflicts](#3-dependency-and-styling-conflicts)
4. [Phased Migration Plan](#4-phased-migration-plan)
5. [Testing and Rollback Strategy](#5-testing-and-rollback-strategy)
6. [Risks and Unresolved Questions](#6-risks-and-unresolved-questions)
7. [Recommended First Step](#7-recommended-first-step)

---

## 1. Current Architecture of Both Projects

### 1.1 `frontend/` — Existing Application (SOURCE OF TRUTH)

| Attribute | Value |
|---|---|
| Framework | React 19 (JSX, no TypeScript) |
| Build tool | Vite 8.2 |
| Package manager | npm (`package-lock.json`) |
| Language | JavaScript (`.jsx`) |
| Linter | oxlint |
| Routing | `react-router-dom` v7 — `BrowserRouter` + `Routes` + `Route` |
| Auth | Supabase OAuth (Google), `onAuthStateChange` listener |
| Data | Supabase JS client — anon key, RLS-governed |
| State | Local `useState` / `useCallback` per page, no global store |
| CSS | Vanilla CSS — one global `index.css` design-token file + per-component `.css` files |
| Fonts | Inter + Outfit (Google Fonts) |
| Icons | Emoji only (no icon library) |
| Port | Vite default (5173) |

**Entry flow:**

```
main.jsx -> App -> AuthProvider -> AppShell
  +-- (no user) -> Landing   (Google OAuth CTA)
  +-- (user)    -> BrowserRouter
       +-- /              -> Dashboard
       +-- /create-plan   -> CreatePlan
       +-- /workout       -> Workout
       +-- /exercise/:id  -> ExerciseDetails
       +-- /progress      -> Progress
```

**Data layer (all in `frontend/src/lib/`):**

| File | Purpose | Tables touched |
|---|---|---|
| `supabase.js` | Singleton client | — |
| `exercises.js` | Seed list + `fetchExercises`, `fetchExerciseById` | `exercises` |
| `plans.js` | Weekly plan builder, `createWorkoutPlan`, `fetchActivePlan` | `workout_plans`, `plan_exercises` |
| `workoutLogs.js` | `fetchWorkoutLogs`, `insertWorkoutLog` | `workout_logs` |
| `userProfile.js` | Profile CRUD, weight history | `users`, `weight_history` |
| `streak.js` | `calculateDailyStreak` (pure fn) | — |

**Existing pages (6):**

| Route | Page | Key business logic |
|---|---|---|
| — | `Landing` | Google OAuth sign-in |
| `/` | `Dashboard` | Week overview, streak, weight delta, completion % |
| `/create-plan` | `CreatePlan` | Profile form -> plan generation -> Supabase insert |
| `/workout` | `Workout` | Day selector, exercise cards, workout log form |
| `/exercise/:id` | `ExerciseDetails` | Exercise info, YouTube embed |
| `/progress` | `Progress` | Charts: completion, weight, streak, log history |

**Existing components (16):**

```
AuthButton, CompletionChart, DaySelector, ExerciseCard,
Navbar, NudgeBanner, ProfileForm, ProgressSummary,
StateScreen, StreakCard, WeeklyCompletion, WeightCard,
WeightChart, WorkoutCard, WorkoutLogForm, YouTubeEmbed
```

Each component has a companion `.css` file — no CSS Modules, no Tailwind.

**Environment variables:**

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY  (also accepts VITE_SUPABASE_PUBLISHABLE_KEY)
VITE_API_URL            (backend Express server)
```

---

### 1.2 `fittrack-2-ui/` — Figma Make Prototype (DESIGN REFERENCE)

| Attribute | Value |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8.0.5 |
| Package manager | pnpm |
| Language | TypeScript (`.tsx`) |
| CSS | Vanilla CSS-in-`index.css` + Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Icons | `lucide-react` ^1.52 |
| Fonts | DM Sans + Instrument Serif (Google Fonts) |
| Routing | NONE — single-file SPA, view switching via `useState<View>` |
| Auth | MOCK — `useState<boolean>` (no Supabase) |
| Data | NONE — all hardcoded; no API calls |
| Port | 8443 (forced via `vite.config.ts`) |
| Extras | Figma-specific plugins in `vite.config.ts` (error overlay replay, refresh boundary fallback, kit server) |

> **IMPORTANT**: All 1122 lines live in a single `App.tsx`. There are no separate component
> files — everything is monolithic. Extraction into separate files is a prerequisite for migration.

**View inventory (9 views inside `App.tsx`):**

| View key | Screen rendered | Missing backend |
|---|---|---|
| `foundations` | Design system page | N/A (documentation only) |
| `home` | Dashboard / readiness | Real user data, workout plan |
| `workout` | Active session tracker | Plan exercise data, log write |
| `plan` | Weekly planner grid | Plan fetch/write, day selection |
| `exercises` | Exercise library + search | Exercise DB query |
| `exercise-detail` | Exercise detail + history | Performance history |
| `progress` | Progress overview | Real workout log data |
| `recovery` | Muscle status | Derived from log analytics |
| `profile` | User profile & prefs | User record from Supabase |

**Shared primitives defined inline in `App.tsx`:**

```
Button, IconButton, Heading, Card, Input, Logo,
Sidebar, BottomNav, Topbar, Ring, PerformanceVisual,
TrendChart, SectionHeading, RestOverlay
```

**Design system token comparison (`index.css` — 722 lines):**

| Token group | New (FitTrack 2.0) | Existing (frontend) |
|---|---|---|
| Background | `#0b0d0c` (near-black, olive tinted) | `hsl(225, 20%, 8%)` (blue-gray) |
| Accent | `#b9f34b` (lime green) | `hsl(220, 90%, 60%)` (blue) |
| Font (body) | DM Sans | Inter |
| Font (heading/display) | Instrument Serif | Outfit |
| Border radius | 20px (`--radius`), 28px (`--radius-lg`) | 10px, 14px |
| Sidebar width | 248px fixed | No sidebar — top navbar |
| Navigation | Desktop sidebar + bottom mobile nav | Horizontal top navbar |

---

## 2. Component and Page Mapping

### 2.1 Pages

| Existing page | FitTrack 2.0 view | Migration action |
|---|---|---|
| `Landing` | `AuthView` | Full redesign — swap layout, keep `signInWithGoogle` hook |
| `Dashboard` | `HomeView` | Major redesign — keep all data hooks, replace markup |
| `Workout` | `WorkoutView` + `PlanView` | Split needed — 2.0 merges active session + plan |
| `CreatePlan` | (no equivalent) | Preserve as-is — plan wizard has no 2.0 design yet |
| `ExerciseDetails` | `ExerciseDetailView` | Redesign — keep YouTube embed, use 2.0 layout |
| `Progress` | `ProgressView` | Major redesign — keep chart components, restyle tabs |
| (new) | `ExercisesView` | New page — exercise library; add route `/exercises` |
| (new) | `RecoveryView` | New page — muscle status; add route `/recovery` |
| (new) | `ProfileView` | New page — user prefs; add route `/profile` |

### 2.2 Components — Reuse vs. Redesign

#### Reuse (keep business logic, redesign markup + CSS)

| Existing component | Mapped to 2.0 | Notes |
|---|---|---|
| `AuthButton` | Auth CTA in Landing | Replace emoji-based button with 2.0 Google button style |
| `WorkoutCard` | Week card in `HomeView` | Keep date/completion props; restyle completely |
| `DaySelector` | weekday-selector strip in `PlanView` | Keep props interface; restyle |
| `ExerciseCard` | exercise-card in `ExercisesView` | Keep planExercise props; restyle |
| `WorkoutLogForm` | Set-row inputs in `WorkoutView` | Keep `insertWorkoutLog` call; redesign to stepper UI |
| `CompletionChart` | TrendChart in `ProgressView` | Keep data format; redesign SVG |
| `WeightChart` | Progress cards in `ProgressView` | Keep weight data props; restyle |
| `WeightCard` | Body weight metric card | Keep weight_kg + delta props |
| `StreakCard` | Flame metric card in `HomeView` | Keep streak prop |
| `ProgressSummary` | Weekly goal strip | Keep completionRate prop |
| `WeeklyCompletion` | Progress track in week card | Keep rate prop |
| `YouTubeEmbed` | Technique/play demo in `ExerciseDetailView` | Keep youtube_url prop |
| `StateScreen` | Loading / error / empty states | Keep all variant props; restyle |
| `NudgeBanner` | Status strip in `HomeView` | Keep message logic; restyle |

#### Full replacement (no existing equivalent)

| 2.0 component | Status |
|---|---|
| `Sidebar` (desktop nav) | New — replace `Navbar` |
| `BottomNav` (mobile nav) | New — replace `Navbar` on small screens |
| `Topbar` (eyebrow + page title) | New — inside each page |
| `Ring` (radial readiness indicator) | New |
| `PerformanceVisual` (SVG animated silhouette) | New (design asset) |
| `RestOverlay` (countdown timer) | New — for active session |
| `ProfileView` / `RecoveryView` | New pages |

#### Navbar to Sidebar migration

The most structurally impactful change. The existing `Navbar` (horizontal, top-mounted) must be
replaced by the 2.0 `Sidebar` (248px fixed left) + `BottomNav` (mobile). All `react-router-dom`
`<NavLink>` links must be preserved — the 2.0 in-memory `navigate(view)` callbacks must be
converted back to `useNavigate()`.

---

## 3. Dependency and Styling Conflicts

### 3.1 Dependency Delta

| Category | `frontend/` has | `fittrack-2-ui/` has | Action needed |
|---|---|---|---|
| Icons | Emoji only | `lucide-react` ^1.52 | Add `lucide-react` to `frontend/` |
| TypeScript | No | Yes | Add optionally or keep JSX and type-erase |
| CSS framework | None | Tailwind CSS v4 | DO NOT add Tailwind v4 (see §3.3) |
| Supabase | `@supabase/supabase-js` ^2 | None | Keep as-is |
| Router | `react-router-dom` v7 | None | Keep; add routes for new pages |
| Fonts | Inter + Outfit | DM Sans + Instrument Serif | Replace font import in `index.css` |
| Package manager | npm | pnpm | Keep npm for `frontend/` |

### 3.2 CSS Token Conflicts

The most critical conflict is the complete color palette replacement:

| Token name | Existing value | 2.0 value | Conflict |
|---|---|---|---|
| `--bg` | `hsl(225,20%,8%)` (blue-gray) | `#0b0d0c` (olive-black) | Overwrite required |
| `--surface` | `hsl(225,18%,12%)` | `#141715` | Overwrite required |
| `--primary` -> `--accent` | `hsl(220,90%,60%)` (blue) | `#b9f34b` (lime) | Semantic break |
| `--border` -> `--line` | `hsl(225,15%,20%)` | `rgba(238,242,232,.09)` | Rename conflict |
| `--radius-sm` | 6px | 12px | Size mismatch |
| `--radius-md` | 10px | 20px (`--radius`) | Scale mismatch |
| `--radius-lg` | 14px | 28px (`--radius-lg`) | Scale mismatch |

WARNING: You cannot safely merge the two `index.css` files. A full token replacement is required,
accompanied by a search-and-replace of all old token names in component `.css` files.

### 3.3 Tailwind Conflict

`fittrack-2-ui` uses `@import "tailwindcss"` at line 2 of its CSS. The existing `frontend/`
uses zero Tailwind utilities. Adding Tailwind v4 would conflict with all existing CSS.

**Recommendation: port to vanilla CSS** — the 2.0 `index.css` already contains all styles as
vanilla classes; Tailwind is only used for the `@import "tailwindcss"` preflight. Removing
that one line removes the Tailwind dependency entirely.

### 3.4 Navigation Architecture Conflict

| Dimension | Existing | 2.0 |
|---|---|---|
| Navigation element | `<nav>` at top | Left `<aside>` sidebar (desktop) + bottom `<nav>` (mobile) |
| Layout offset | `page-container: max-width 1100px, padding 2rem` | `main-panel: margin-left 248px` |
| Route links | `<NavLink to="...">` | `onClick={() => navigate(view)}` (in-memory) |
| Mobile | Responsive top nav | Fixed `bottom-nav` with 5 items |

### 3.5 TypeScript vs. JavaScript

- **Option A (recommended):** Keep `frontend/` in JS; convert extracted 2.0 components to
  `.jsx` — type-erasing `.tsx` files is trivial.
- **Option B:** Migrate `frontend/` to TypeScript by adding `tsconfig.json` incrementally.

### 3.6 Vite Config Conflict

`fittrack-2-ui`'s `vite.config.ts` contains 4 Figma-specific plugins. These must NOT be
copied to `frontend/`. The `frontend/vite.config.js` is minimal and correct.

---

## 4. Phased Migration Plan

Each phase is an isolated branch. The existing app remains fully functional after every merge.

---

### Phase 0 — Design Token Foundation (1-2 days)

**Goal**: Establish the 2.0 design system inside `frontend/` without touching any page layout.

**Tasks**:
1. Replace `frontend/src/index.css` `:root` block with the 2.0 token set.
2. Replace Google Fonts import with `DM Sans + Instrument Serif`.
3. Add `lucide-react` to `frontend/package.json`.
4. Update per-component `.css` files (token rename map):
   - `--primary` -> `--accent`
   - `--border` -> `--line`
   - `--font-body` -> `--sans`
   - `--font-heading` -> `--serif`
   - `--radius-md` -> `--radius`
   - `--text-primary` -> `--text`
   - `--text-secondary` -> `--muted`

**Acceptance criteria**: App runs; all pages render; Supabase auth works.
**Branch**: `feat/F0X-design-tokens`

---

### Phase 1 — Structural Navigation (2-3 days)

**Goal**: Replace the top `Navbar` with the 2.0 `Sidebar` + `BottomNav`.

**Tasks**:
1. Create `frontend/src/components/Sidebar/Sidebar.jsx` — extracted from 2.0, with `<NavLink>`.
2. Create `frontend/src/components/BottomNav/BottomNav.jsx`.
3. Create `frontend/src/components/Topbar/Topbar.jsx`.
4. Update `App.jsx` shell: remove `<Navbar />`, add `<Sidebar />` + `<BottomNav />`.
5. Add `Logo` component using `lucide-react` Dumbbell icon.

**Acceptance criteria**: All existing routes work; sidebar active state correct; bottom nav works on mobile.
**Branch**: `feat/F0X-sidebar-navigation`

---

### Phase 2 — Landing / Auth Redesign (1-2 days)

**Goal**: Replace `Landing.jsx` with the 2.0 `AuthView` design. No auth logic changes.

**Tasks**:
1. Replace markup with 2.0 `AuthView` split-screen layout (visual left / form right).
2. Wire sign-in form to `signInWithGoogle` from `useAuth()`.
3. Port `PerformanceVisual` SVG + animations from 2.0.
4. Register panel forwards to `/create-plan` or shows a placeholder.

**Acceptance criteria**: Google OAuth sign-in works; session persists on reload.
**Branch**: `feat/F0X-auth-redesign`

---

### Phase 3 — Dashboard Redesign (2-3 days)

**Goal**: Replace `Dashboard.jsx` markup with 2.0 `HomeView`. All data fetching preserved verbatim.

**Tasks**:
1. Extract 2.0 subcomponents: `Ring`, `TrendChart`, `SectionHeading`, metric cards.
2. Rewrite markup: `home-grid` / `home-primary` / `home-secondary` layout.
3. Map state vars:
   - `completionRate` -> weekly goal progress bar
   - `streak` -> flame metric card
   - `currentWeight` / `weightChange` -> body weight metric card
   - `weekSchedule` / `allDates` -> week card days
4. Replace `WorkoutCard` with 2.0 hero card.
5. Map `NudgeBanner` -> status strip; preserve `StateScreen` for all async states.

**Acceptance criteria**: Dashboard renders real Supabase data; streak and weight delta correct.
**Branch**: `feat/F0X-dashboard-redesign`

---

### Phase 4 — Workout + Plan Pages (3-5 days)

**Goal**: Redesign `Workout.jsx` to 2.0 active session layout; add new `/plan` route.

**Tasks**:
1. Add `/plan` route; create `frontend/src/pages/Plan/Plan.jsx` wired to `fetchActivePlan()`.
2. Redesign `Workout.jsx`: exercise media panel, set-row stepper UI, `RestOverlay` countdown.
3. Map `WorkoutLogForm` inputs to stepper UI — keep `insertWorkoutLog` call unchanged.

**Acceptance criteria**: Workout logging persists to Supabase; plan exercises load correctly.
**Branch**: `feat/F0X-workout-plan-redesign`

---

### Phase 5 — Exercises Library + Exercise Detail (2-3 days)

**Goal**: Add `/exercises` route with 2.0 `ExercisesView`; redesign `/exercise/:id`.

**Tasks**:
1. Create `frontend/src/pages/Exercises/Exercises.jsx` wired to `fetchExercises()`.
2. Client-side muscle group and equipment filtering against seed list.
3. Redesign `ExerciseDetails.jsx` to match 2.0 `ExerciseDetailView`; keep `YouTubeEmbed`.

**Branch**: `feat/F0X-exercises-library`

---

### Phase 6 — Progress, Recovery, Profile (3-4 days)

**Goal**: Redesign `Progress.jsx`; add `/recovery` and `/profile` routes.

**Tasks**:
1. Redesign `Progress.jsx` markup; swap charts to 2.0 TrendChart SVG.
2. Add `/recovery` -> `RecoveryView` (heuristic muscle status from workout logs).
3. Add `/profile` -> `ProfileView` wired to `fetchUserProfile()` + `saveUserProfile()`.

**Branch**: `feat/F0X-progress-recovery-profile`

---

### Phase 7 — Polish + Performance (1-2 days)

**Tasks**:
1. Add `/design-system` route for `FoundationsView` (QA reference).
2. Enable all 2.0 CSS animations (athlete-breathe, energy-flow, orbit-shift, particle-float).
3. Lighthouse audit on all pages; fix regressions.
4. Verify all interactive elements have unique `id=` attributes (per AGENTS.md).

---

## 5. Testing and Rollback Strategy

### 5.1 Testing Approach

| Layer | What to test | How |
|---|---|---|
| Auth | Google OAuth, session persistence, sign-out | Manual E2E per phase |
| Supabase reads | Dashboard, Workout, Progress load real data | Manual; smoke assertions |
| Supabase writes | `insertWorkoutLog`, `createWorkoutPlan`, `insertWeight`, `saveUserProfile` | Manual form tests |
| RLS | Each call uses anon key (never service role) | Code review |
| Routing | All existing + new routes resolve | Browser navigation |
| Responsiveness | Sidebar collapses; bottom nav appears on mobile | DevTools resize |
| CSS tokens | No broken `var(--xxx)` references after rename | DevTools computed styles |

NOTE: No automated tests currently exist in `frontend/`. Adding a Playwright smoke suite
before Phase 1 is strongly recommended.

### 5.2 Rollback Strategy

- Per-phase branches (`feat/F0X-*`): any phase can be reverted with `git revert`.
- Supabase schema is unchanged: rollback risk is UI-only.
- No dependency removals: only additions (`lucide-react`).
- Environment variables unchanged: all existing `VITE_*` vars remain required.
- `fittrack-2-ui/` is never modified: remains as permanent visual reference.

### 5.3 Feature Flags (optional)

```js
const useNewUI = new URLSearchParams(window.location.search).has('new-ui');
```

Allows toggling between old and new layouts in production before full cutover.

---

## 6. Risks and Unresolved Questions

### 6.1 High Risks

| Risk | Impact | Mitigation |
|---|---|---|
| CSS token rename breaks component styles | Visual regressions across 16 components | Token rename map + search-and-replace; visual diff each page |
| Sidebar + router `NavLink` active states break | Broken navigation UX | Verify `isActive` props after Phase 1 |
| `WorkoutLogForm` inputs don't map to stepper UI | Data loss risk on form submit | Keep existing form logic; only replace markup |
| `BrowserRouter` scope relative to `AuthProvider` | Auth state unavailable | Current code is correct; verify remains true after Phase 1 |

### 6.2 Open Design Questions (must resolve before relevant phase)

1. **`CreatePlan` has no 2.0 design.** Will a 2.0 variant be designed, or does it stay as-is?
2. **`RecoveryView`** shows muscle-group recovery %. The schema has no `recovery_percentage`
   column. Data source options: (a) heuristic from last-log date, (b) new table, (c) static.
3. **RIR (Reps In Reserve)** appears in 2.0 `WorkoutView`. No `rir` column in `workout_logs`.
   Schema addition or UI-only hint?
4. **Strength Score (842)** is hardcoded in 2.0. How should it be computed from real data?
5. **Superset linking** (`Link2` icon in `PlanView`) implies `superset_group_id` in
   `plan_exercises`. Schema addition or deferred?
6. **Exercise images**: `fittrack-2-ui` uses 3 bundled `.jpg` files. `exercises` table has
   `youtube_url` but no `image_url`. Should images be added to seed data?
7. **Phone auth**: 2.0 `AuthView` shows email/phone toggle. Phone OTP not configured in
   Supabase. Implement or hide?
8. **`docs/BUILD_SPEC.md`**: Have new routes (Exercises, Recovery, Profile) been formally
   added to the authoritative backlog?

### 6.3 Dependency Version Notes

| Package | frontend | fittrack-2-ui | Notes |
|---|---|---|---|
| `react` | 19.2.8 | 19.0.0 | Minor gap; no API differences |
| `vite` | 8.2.2 | 8.0.5 | Both Vite 8; compatible |
| `lucide-react` | not installed | 1.52 | Must be added to `frontend/` |
| `@tailwindcss/vite` | not installed | 4.0.0 | Must NOT be added (see §3.3) |

---

## 7. Recommended First Step

**Start with Phase 0 token extraction — safest possible change, unlocks everything else.**

### Task: Replace `frontend/src/index.css` design tokens only

1. Open `frontend/src/index.css`.
2. Replace the `:root {}` block with the 2.0 token set from `fittrack-2-ui/src/index.css` lines 4-31.
3. Replace the Google Fonts import with `DM Sans + Instrument Serif`.
4. Add legacy token aliases so old names still resolve (no component `.css` files need changes yet):

```css
:root {
  /* === FitTrack 2.0 canonical tokens === */
  --bg: #0b0d0c;
  --bg-raised: #101311;
  --surface: #141715;
  --surface-hover: #1a1e1b;
  --line: rgba(238, 242, 232, 0.09);
  --line-strong: rgba(238, 242, 232, 0.15);
  --text: #f1f1e9;
  --muted: #92988f;
  --faint: #5e645e;
  --accent: #b9f34b;
  --accent-strong: #9edc2d;
  --accent-ink: #132000;
  --amber: #d8a75b;
  --cool: #83aeb2;
  --danger: #d97966;
  --sans: "DM Sans", sans-serif;
  --serif: "Instrument Serif", serif;
  --radius-sm: 12px;
  --radius: 20px;
  --radius-lg: 28px;
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.28);

  /* === Legacy aliases — remove during Phase 0 cleanup === */
  --primary:        var(--accent);
  --border:         var(--line);
  --font-body:      var(--sans);
  --font-heading:   var(--serif);
  --radius-md:      var(--radius);
  --text-primary:   var(--text);
  --text-secondary: var(--muted);
  --text-tertiary:  var(--faint);
  --success:        var(--accent);
}
```

5. Run `npm run dev` in `frontend/` and verify the app starts.
6. Open each page; take screenshots for before/after visual diff.

**Why this is safe:**
- No component files touched.
- No Supabase calls touched.
- No routing changes.
- Fully reversible with `git checkout frontend/src/index.css`.
- Immediately gives FitTrack 2.0 palette + typography in the existing app.

**Branch**: `feat/F0X-design-tokens`

---

*Update this document after each phase. Write `docs/adr/NNNN-title.md` for each major
architectural decision (TypeScript adoption, Tailwind strategy, RIR schema, etc.).*
