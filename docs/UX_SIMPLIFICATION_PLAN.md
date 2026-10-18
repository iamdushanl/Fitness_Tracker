# FitTrack 2.0 — UX Simplification Plan

> **Purpose**: Reduce cognitive load, eliminate dead-end flows, and make every primary action obvious without increasing feature scope.
> **Constraint**: Fixes must not require new backend infrastructure. All simplifications use existing Supabase client and React state.

---

## Journey A: First-time User Onboarding

### Current Flow (broken)
1. User sees landing page with **Google** + **Email** + **Phone** tabs
2. User tries email/password → form submits Google OAuth (P0-1)
3. After Google login, user lands on Dashboard with **no plan**
4. Dashboard shows generic "Create Your Plan" state, with hero CTA "Create my plan"
5. User goes to `/create-plan` and fills a 6-field form
6. Plan is created; user is auto-redirected to `/workout`

### Problem
- Two auth methods (email, phone) are shown but only Google works
- "Forgot password?" triggers Google OAuth — deeply confusing
- Landing page collects credentials it never uses

### Recommendation
**Simplify to one auth method in the UI until email is implemented.**

1. Remove the Email/Phone method tab row from the Landing page entirely
2. Remove the email/phone input fields (they collect data that is thrown away)
3. Keep only: "Continue with Google" CTA + tagline
4. Replace "Forgot password?" with nothing (or a greyed "Email sign-in coming soon" note)
5. Keep the Login / Register sliding panels but remove forms from both

**Result**: One screen, one action, zero confusion. Auth-type expansion can be added incrementally.

---

## Journey B: Creating a Workout Plan

### Current Issues
- `ProfileForm.jsx` uses goal IDs (`weight_loss`, `muscle_gain`) that don't exist in `Profile.jsx`'s `GOAL_OPTIONS`
- `buildWeeklyScheduleTemplate` ignores the goal — same plan is generated for all goals
- After plan is created, success message exposes implementation details ("saved to Supabase")

### Recommendations

1. **Unify the goal enum** — define a single shared constant:
   ```js
   // packages/shared-types or frontend/src/lib/goals.js
   export const FITNESS_GOALS = [
     { id: 'build_strength', label: 'Build Strength' },
     { id: 'hypertrophy', label: 'Muscle Hypertrophy' },
     { id: 'general_fitness', label: 'General Fitness' },
     { id: 'fat_loss', label: 'Fat Loss & Definition' },
   ];
   ```
   Use this in `ProfileForm.jsx`, `Profile.jsx`, and `plans.js`.

2. **Make the success message user-facing** — replace "saved to Supabase" with "Your [goal] plan is live. Time to train."

3. **Redirect to `/plan` (viewer) after plan creation**, not `/workout`. Users should see their schedule before being dropped into a live session.

---

## Journey C: Logging a Workout Session

### Current Issues
- "Finish" button has no guard: fires with 0 sets logged
- "Review workout logs" returns to the workout screen instead of going to Progress
- The day selector shows all 7 plan dates; today is selected automatically, but if no workout is planned today, it shows the first date in the plan (which may be a past date)
- Session completion screen blocks the entire page with no way to access logs until the button is clicked

### Recommendations

1. **Guard the Finish button**:
   - If `completedSets === 0`: change label to "Skip session" and show confirmation prompt
   - If `completedSets > 0`: show "Finish session (N sets logged)"

2. **Fix "Review workout logs" navigation**:
   ```js
   // Replace:
   onClick={() => setSessionFinished(false)}
   // With:
   onClick={() => navigate('/progress')}
   ```

3. **Day selector default**: When the user opens `/workout`, prefer today if scheduled; if today is a rest day, show "Rest Day" card immediately without selecting a different day. Do not silently jump to a past workout date.

4. **Session completion actions**: Show "Return to Overview" and "View Progress" (→ `/progress`) instead of "Review workout logs" which implies the current screen has logs.

---

## Journey D: Viewing Progress & Metrics

### Current Issues
- Five tabs (Overview, Strength, Volume, Muscles, Weight) but only Weight changes any content — massive discoverability failure
- Progress shows two inconsistent performance scores vs. Dashboard
- "Personal records" shows `3` or `7` regardless of actual PRs
- TrendChart appears to show static decorative data unrelated to the user

### Recommendations

1. **Remove or rename non-functional tabs**. Options:
   - **Option A** (minimal): Remove Strength, Volume, Muscles tabs; keep Overview and Weight
   - **Option B** (preferred): Implement tab-switching using existing data:
     - **Overview**: Current layout
     - **Strength**: Filter `workoutLogs` to strength category, show best set per exercise
     - **Volume**: Show total tonnage per week from `workoutLogs`
     - **Weight**: Weight chart only
     - Remove Muscles tab (duplicate of Recovery page)

2. **Replace "Personal records" hardcoded value** with actual computed max weight per exercise:
   ```js
   const prs = workoutLogs.reduce((acc, log) => {
     const key = log.plan_exercise_id;
     if (!acc[key] || log.actual_weight_kg > acc[key]) acc[key] = log.actual_weight_kg;
     return acc;
   }, {});
   const prCount = Object.keys(prs).length;
   ```

3. **Unify performance score**: Use one formula across Dashboard and Progress, or remove the score metric from Progress entirely and keep only in Dashboard.

---

## Journey E: Recovery & Muscle Status

### Current Issues
- Recovery/Volume/Untrained tabs change `activeTab` state but no content changes
- Recovery page is isolated — Dashboard has hardcoded readiness bars that never reference the Recovery computation
- The body figure uses CSS class `tired` but legend says `fatigued`; `warm` vs `recovering` mismatch

### Recommendations

1. **Recovery tabs** — simplify to one view until content is differentiated:
   - Remove Volume and Untrained tabs (no content exists for them)
   - Rename single view "Recovery Status"

2. **Dashboard readiness bars** — replace hardcoded values with the same `muscleList` computation from `Recovery.jsx`:
   - Extract `calculateMuscleRecovery(workoutLogs, planExercises)` into a shared library function
   - Call it from both Dashboard and Recovery

3. **Fix vocabulary inconsistency**:
   - Standardise on: `Ready`, `Recovering`, `Fatigued`, `Detrained` (CSS classes and legend)

---

## Quick Wins (Low effort, high impact)

| Fix | File | Effort | Impact |
|---|---|---|---|
| Fix "Open plan" link to `/plan` | `Dashboard.jsx:323` | 1 min | P2-1 |
| "Review workout logs" → `navigate('/progress')` | `Workout.jsx:306` | 1 min | P1-7 |
| Add guard on Finish button | `Workout.jsx:383` | 15 min | P1-1 |
| Remove non-functional tabs (Recovery + Progress) | `Recovery.jsx`, `Progress.jsx` | 20 min | P2-2, P2-3 |
| Remove filter toggle button onClick gap | `Exercises.jsx:193` | 5 min | P2-4 |
| Remove ChevronRight from non-interactive profile rows | `Profile.jsx:182-207` | 10 min | P2-5 |
| Fix weight change label from "this week" to "since start" | `Dashboard.jsx:446` | 2 min | P2-11 |
| Conditionalize "Plan active" badge | `Profile.jsx:158` | 10 min | P2-6 |
| Fix "Forgot password?" → real reset flow | `Landing.jsx:191` | 30 min | P0-1 |
| Move BrowserRouter to `main.jsx` | `App.jsx` + `main.jsx` | 10 min | P0-3 |

---

## What NOT to simplify

- The workout set stepper (weight/reps increment buttons) — functional and appropriate
- The day selector in Workout tracker — clear and necessary
- The weight logging modal in Progress — straightforward and correct
- The exercise search + muscle/category filters — all work correctly
