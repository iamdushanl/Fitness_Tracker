# FitTrack 2.0 — Test Plan

> **Purpose**: Prescribe tests that will verify the defects identified in `PRODUCT_QUALITY_AUDIT.md` are fixed.
> **Framework**: Vitest (unit/integration), Playwright or Cypress (E2E)
> **Test scope**: `frontend/src/` — colocated tests at `foo.test.jsx` / `foo.test.js`

---

## 1. Unit Tests — Library Functions

### 1.1 `streak.js` — `calculateDailyStreak`

File: `frontend/src/lib/streak.test.js`

| Test | Input | Expected Output |
|---|---|---|
| No logs | `[]` | `0` |
| One log today | `[today]` | `1` |
| One log yesterday, none today | `[yesterday]` | `1` |
| Three consecutive days ending today | `[2d ago, yesterday, today]` | `3` |
| Two consecutive days ending yesterday | `[3d ago, 2d ago, yesterday]` | `3` |
| Gap breaks streak | `[5d ago, today]` | `1` |
| Two logs same day | `[today, today]` | `1` (deduplicated) |
| Log more than 2 days ago, none since | `[3d ago]` | `0` |

---

### 1.2 `workoutLogs.js` — `insertWorkoutLog`

File: `frontend/src/lib/workoutLogs.test.js`

| Test | Scenario | Expected |
|---|---|---|
| Logged set row shape | Call `insertWorkoutLog({plan_exercise_id, performed_at, actual_sets:1, actual_reps:10, actual_weight_kg:60})` | Returns `{ data: { id, user_id, ... }, error: null }` |
| Unauthenticated | Call with no active session | Returns `{ data: null, error: { message: 'Not authenticated' } }` |
| Missing optional fields | Omit `notes` | `notes` is stored as `null` |

---

### 1.3 `userProfile.js` — `insertWeight`

File: `frontend/src/lib/userProfile.test.js`

| Test | Scenario | Expected |
|---|---|---|
| Valid weight insert | `insertWeight(75.5)` | `{ data: { weight_kg: 75.5, ... }, error: null }` |
| Also updates users table | After insert, fetch `users` row | `weight_kg` is synced to `75.5` |
| Unauthenticated | No session | `{ data: null, error }` |

---

### 1.4 `plans.js` — `getCurrentWeekDates`

File: `frontend/src/lib/plans.test.js`

| Test | Scenario | Expected |
|---|---|---|
| Returns 7 dates | Call | `dates.length === 7` |
| First date is Monday | Call on any day | `dates[0]` is the Monday of the current week |
| Dates are ISO strings | Call | All match `/^\d{4}-\d{2}-\d{2}$/` |
| `week_start_date` equals `dates[0]` | Call | True |

---

## 2. Component Unit Tests

### 2.1 `Landing.jsx` — Auth form behaviour (once fixed)

File: `frontend/src/pages/Landing/Landing.test.jsx`

| Test | Action | Expected |
|---|---|---|
| Google button triggers `signInWithGoogle` | Click "Continue with Google" | `signInWithGoogle` mock is called |
| Email form submit calls `signInWithPassword` | Fill email + password + click "Sign in" | `supabase.auth.signInWithPassword` is called with correct values |
| Phone form submit calls `signInWithOtp` | Select Phone tab + fill number + click "Sign in" | `supabase.auth.signInWithOtp` is called |
| "Forgot password?" calls `resetPasswordForEmail` | Click "Forgot password?" | `supabase.auth.resetPasswordForEmail` is called |
| Register form calls `signUp` | Fill register form + click "Create account" | `supabase.auth.signUp` is called |
| Mode toggle works | Click "Create an account" | Register panel is visible |

---

### 2.2 `ProfileForm.jsx` — Validation

File: `frontend/src/components/ProfileForm/ProfileForm.test.jsx`

| Test | Action | Expected |
|---|---|---|
| Empty submit shows errors | Click submit with empty form | Error messages shown for all required fields |
| Valid submit fires callback | Fill all fields + click submit | `onSubmit` called with correct typed values |
| Goal enum matches plans.js | Submit with each goal option | `fitness_goal` value is one of `FITNESS_GOALS` IDs |
| Negative age rejected | Enter age = `-1` | Validation error shown |

---

### 2.3 `Workout.jsx` — Finish button guard (once fixed)

File: `frontend/src/pages/Workout/Workout.test.jsx`

| Test | Action | Expected |
|---|---|---|
| Finish with 0 sets → "Skip session" | Click Finish immediately | Either confirmation prompt or button label changes to "Skip session" |
| Finish with 1+ sets | Log a set then click Finish | Session completion screen shown |
| "View Progress" after finish | Click post-session progress CTA | Router navigates to `/progress` |

---

### 2.4 `Dashboard.jsx` — Metric accuracy

File: `frontend/src/pages/Dashboard/Dashboard.test.jsx`

| Test | Mock data | Expected |
|---|---|---|
| Completion rate = 0 when no logs | `workoutLogs=[]`, `planExercises=[e1,e2]` | `completionRate === 0` |
| Streak displayed correctly | 3 logs on 3 consecutive days | Streak badge shows `3` |
| Body weight shows weight_history latest | `weightHistory=[{weight_kg:72},{weight_kg:75}]` | `currentWeight === 75` |
| Weight change uses first vs last | Same history above | `weightChange === 3` |

---

### 2.5 `Progress.jsx` — Weight logging modal

File: `frontend/src/pages/Progress/Progress.test.jsx`

| Test | Action | Expected |
|---|---|---|
| Modal opens | Click "+" log weight button | Modal is visible (`aria-modal="true"`) |
| Valid submit calls `insertWeight` | Enter `74.5` + click "Record Weight" | `insertWeight` called with `74.5` |
| Non-numeric input rejected | Enter `abc` | Submit does not call `insertWeight` |
| Backdrop click closes modal | Click outside modal | Modal is hidden |
| ESC key closes modal | Press Escape | Modal is hidden (if implemented) |

---

## 3. Integration / Journey Tests (E2E — Playwright or Cypress)

### 3.1 Journey A: User Authentication

**Precondition**: Supabase project is active.

| Step | Action | Assertion |
|---|---|---|
| A1 | Open app at `http://localhost:5173` | Landing page visible (`#landing-auth-page`) |
| A2 | Click "Continue with Google" | Google OAuth redirect initiated (or test account sign-in) |
| A3 | Return from OAuth | App shell visible (`#app-shell-root`) |
| A4 | Dashboard loads | `#dashboard-page` visible, not in loading state |
| A5 | Sign out | Landing page visible again |

---

### 3.2 Journey B: Create a Workout Plan

**Precondition**: Logged in, no existing plan.

| Step | Action | Assertion |
|---|---|---|
| B1 | Navigate to `/create-plan` | `#create-plan-page` visible |
| B2 | Fill name, age, height, weight | Inputs accept values |
| B3 | Select experience level "Intermediate" | Button highlighted |
| B4 | Select fitness goal | Button highlighted |
| B5 | Click "Generate My Plan" | Loading state shown |
| B6 | Plan saved | Success state shown; auto-redirect to `/workout` or `/plan` |
| B7 | Navigate to `/plan` | 7-day schedule grid visible with exercises |

---

### 3.3 Journey C: Log a Workout Set

**Precondition**: Active plan exists.

| Step | Action | Assertion |
|---|---|---|
| C1 | Navigate to `/workout` | Workout tracker loads with exercise list |
| C2 | Select a workout day | Exercise panel updates |
| C3 | Click weight increment (+) | Weight value increases by 2.5 |
| C4 | Click reps decrement (−) | Reps value decreases by 1 (min 1) |
| C5 | Click "Log set" check button | Set row gets `completed` class; row.done = true |
| C6 | Rest overlay appears | `RestOverlay` component visible |
| C7 | Click "Skip" | Rest overlay dismissed |
| C8 | Click "Finish" (with ≥1 set logged) | Session completion screen shown |
| C9 | Click "View Progress" | Navigate to `/progress` |
| C10 | Verify log appears in Progress | `#history-heading` section shows logged set |

---

### 3.4 Journey D: Log Body Weight

**Precondition**: Logged in, any state.

| Step | Action | Assertion |
|---|---|---|
| D1 | Navigate to `/progress` | Progress page loads |
| D2 | Click "+" Log Weight button | Weight modal visible |
| D3 | Enter `75.5` in the input | Input shows `75.5` |
| D4 | Click "Record Weight" | Modal closes; body weight metric updates to `75.5 kg` |
| D5 | Switch to Weight tab | WeightChart visible with new data point |

---

### 3.5 Journey E: Edit Athlete Profile

**Precondition**: Logged in.

| Step | Action | Assertion |
|---|---|---|
| E1 | Navigate to `/profile` | `#profile-page` visible; display name shown |
| E2 | Click "Edit Profile" | Modal sheet visible |
| E3 | Change weight to `80` | Input reflects change |
| E4 | Change fitness goal | Select updates |
| E5 | Click "Save Profile" | Modal closes; profile hero updates |
| E6 | Verify Supabase | `users` table row has updated values |

---

## 4. Regression Tests — Previously Reported Bugs

| Bug ID | Test Description | Pass Criteria |
|---|---|---|
| P0-1 | Email form submit calls `signInWithPassword`, not `signInWithGoogle` | `signInWithGoogle` NOT called when email+password form submitted |
| P0-2 | Phone tab submission calls `signInWithOtp` | `signInWithOtp` called with the phone number value |
| P0-3 | BrowserRouter is available in Landing context | `useNavigate()` in Landing does not throw |
| P1-1 | Finish button with 0 sets shows guard | No `sessionFinished=true` without at least 1 log |
| P1-2 | Completion rate formula corrected | `completionRate` equals completed exercise count / total exercises, not sets / exercises |
| P1-3 | Dashboard muscle bars use Recovery computation | Bars show values computed from `calculateMuscleRecovery`, not hardcoded 84/78/91 |
| P1-4 | Personal records count is real | PR count equals distinct exercises with a logged max-weight |
| P1-6 | Goal enum unified | Profile page and ProfileForm share same goal IDs |
| P1-7 | "Review logs" navigates to `/progress` | `location.pathname === '/progress'` after click |
| P2-1 | "Open plan" links to `/plan` | Click navigates to `#plan-page` |

---

## 5. Test Configuration Notes

- **Vitest** is the mandated test runner (`vitest`)
- Tests are colocated: `Dashboard.jsx` → `Dashboard.test.jsx`
- Supabase calls should be mocked in unit tests using `vi.mock('../lib/supabase')`
- E2E tests use a dedicated test Supabase project (never the production database)
- Do not use real OAuth in CI — use Supabase email+password test accounts
- Inject a `testClock` into `calculateDailyStreak` for deterministic streak tests (the function already accepts `referenceDate`)
