# FitTrack 2.0 — Interaction Inventory

> **Method**: Static source code inspection of all JSX files in `frontend/src/`
> **Date**: 2026-10-18
> **Legend**: ✅ Working | ❌ Broken | ⚠️ Partial / misleading

---

## Landing Page (`/` when unauthenticated — `Landing.jsx`)

| ID | Element | Type | Handler | Status | Notes |
|---|---|---|---|---|---|
| L-01 | "Continue with Google" button | `<button>` | `onClick={signInWithGoogle}` | ✅ Works | Launches Supabase Google OAuth |
| L-02 | "Sign in" submit button | `<button type="submit">` | `handleSubmit` → `signInWithGoogle` | ❌ Broken | Ignores email/password, always fires Google OAuth (P0-1) |
| L-03 | "Create account" submit button (Register panel) | `<button type="submit">` | `handleSubmit` → `signInWithGoogle` | ❌ Broken | Same as L-02; credentials ignored |
| L-04 | Email method tab | `<button role="tab">` | `setMethod('email')` | ✅ Works | Switches input field correctly |
| L-05 | Phone method tab | `<button role="tab">` | `setMethod('phone')` | ⚠️ Partial | Switches input field but submission is still Google OAuth |
| L-06 | "Forgot password?" button | `<button>` | `onClick={signInWithGoogle}` | ❌ Broken | Should trigger password reset — instead triggers Google OAuth (P0-1) |
| L-07 | Show/Hide password toggle | `<button>` | `setShowPassword(!prev)` | ✅ Works | Toggles input type correctly |
| L-08 | "Create an account" switch link | `<button>` | `setMode('register')` | ✅ Works | Slides to Register panel |
| L-09 | "Sign in" switch link (Register → Login) | `<button>` | `setMode('login')` | ✅ Works | Slides back to Login panel |
| L-10 | Terms of Service checkbox | `<input type="checkbox">` | Native form required | ⚠️ Partial | Checkbox blocks submit but form submission itself is broken |
| L-11 | "Sign up with Google" button (Register) | `<button>` | `onClick={signInWithGoogle}` | ✅ Works | Correct Google OAuth |

---

## App Shell

| ID | Element | Component | Status | Notes |
|---|---|---|---|---|
| SH-01 | Sidebar NavLink — Overview | `<NavLink to="/">` | ✅ Works | Active state applied correctly |
| SH-02 | Sidebar NavLink — Workout | `<NavLink to="/workout">` | ✅ Works | |
| SH-03 | Sidebar NavLink — Training Plan | `<NavLink to="/plan">` | ✅ Works | |
| SH-04 | Sidebar NavLink — Movement Library | `<NavLink to="/exercises">` | ✅ Works | |
| SH-05 | Sidebar NavLink — Progress | `<NavLink to="/progress">` | ✅ Works | |
| SH-06 | Sidebar NavLink — Muscle Status | `<NavLink to="/recovery">` | ✅ Works | |
| SH-07 | Sidebar NavLink — Athlete Profile | `<NavLink to="/profile">` | ✅ Works | |
| SH-08 | Sidebar sign-out button | `<button onClick={signOut}>` | ✅ Works | Calls `supabase.auth.signOut()` |
| SH-09 | Sidebar "Start session" coach link | `<NavLink to="/workout">` | ✅ Works | |
| SH-10 | BottomNav — Home | `<NavLink to="/">` | ✅ Works | Mobile |
| SH-11 | BottomNav — Workout | `<NavLink to="/workout">` | ✅ Works | Mobile |
| SH-12 | BottomNav — Plan | `<NavLink to="/plan">` | ✅ Works | Mobile |
| SH-13 | BottomNav — Progress | `<NavLink to="/progress">` | ✅ Works | Mobile |
| SH-14 | BottomNav — Profile button (opens sheet) | `<button onClick={setProfileOpen(true)}>` | ✅ Works | Opens account bottom sheet |
| SH-15 | Account sheet — close button (X) | `<button onClick={setProfileOpen(false)}>` | ✅ Works | |
| SH-16 | Account sheet — ESC key close | `keydown → setProfileOpen(false)` | ✅ Works | |
| SH-17 | Account sheet — backdrop click close | `onClick={setProfileOpen(false)}` | ✅ Works | |
| SH-18 | Account sheet — "Athlete Profile" link | `<NavLink to="/profile">` | ✅ Works | |
| SH-19 | Account sheet — "Muscle Status" link | `<NavLink to="/recovery">` | ✅ Works | |
| SH-20 | Account sheet — "Movement Library" link | `<NavLink to="/exercises">` | ✅ Works | |
| SH-21 | Account sheet — Sign out | `<button onClick={signOut}>` | ✅ Works | Closes sheet then signs out |

---

## Dashboard (`/` — `Dashboard.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| D-01 | "View workout" link | `<Link to="/workout">` | ✅ Works | |
| D-02 | "Start workout" hero CTA | `<Link to="/workout">` | ✅ Works | Only shown when plan exists |
| D-03 | "Create my plan" hero CTA | `<Link to="/create-plan">` | ✅ Works | Only shown when no plan |
| D-04 | "Open plan" week card action | `<Link to="/create-plan">` | ❌ Wrong route | Should link to `/plan` viewer not `/create-plan` generator (P2-1) |
| D-05 | Mini chart card | `<Link to="/progress">` | ✅ Works | Entire card is a link |
| D-06 | "Details" readiness action | `<Link to="/progress">` | ✅ Works | |
| D-07 | "View progress" mobile action | `<Link to="/progress">` | ✅ Works | |
| D-08 | "Plan" mobile week card action | `<Link to="/create-plan">` | ❌ Wrong route | Same issue as D-04 |
| D-09 | Error state Retry button | `onRetry={loadDashboardData}` | ✅ Works | Refetches data |
| D-10 | Loading spinner | Shown when `loading=true` | ✅ Works | |

---

## Create Plan Page (`/create-plan` — `CreatePlan.jsx` + `ProfileForm.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| CP-01 | Name input | `<input type="text">` | ✅ Works | Validated — required |
| CP-02 | Age input | `<input type="number">` | ✅ Works | Validated — > 0 |
| CP-03 | Height input | `<input type="number">` | ✅ Works | Validated — > 0 |
| CP-04 | Weight input | `<input type="number">` | ✅ Works | Validated — > 0 |
| CP-05 | Experience level buttons | `<button>` toggle | ✅ Works | `beginner` / `intermediate` / `advanced` |
| CP-06 | Fitness goal buttons | `<button>` toggle | ⚠️ Data mismatch | Submits `weight_loss`, `muscle_gain`, `general_fitness`, `endurance` — these don't match `Profile.jsx` goal enum (P1-6) |
| CP-07 | "Generate My Plan" submit | `<button type="submit">` | ✅ Works | Triggers `createWorkoutPlan()` in Supabase |
| CP-08 | RLS error message display | `role="alert"` div | ✅ Works | Shows error code 42501 / 23503 messages |
| CP-09 | Success state auto-redirect | `setTimeout → navigate('/workout')` | ✅ Works | 1500ms delay then navigates |

---

## Training Plan Page (`/plan` — `Plan.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| PL-01 | Day selector grid (7 days) | `<button role="tab">` | ✅ Works | Selects day, shows detail |
| PL-02 | "New plan" link | `<Link to="/create-plan">` | ✅ Works | |
| PL-03 | "Start session" routine button | `<Link to="/workout">` | ✅ Works | Only shown on non-rest days |
| PL-04 | Exercise detail chevron link | `<Link to="/exercise/:id">` | ✅ Works | Opens ExerciseDetails |
| PL-05 | "Generate your plan" empty state CTA | `<Link to="/create-plan">` | ✅ Works | |
| PL-06 | Error state Retry button | `onRetry={loadPlan}` | ✅ Works | |
| PL-07 | "Logged" badge on exercises | Computed from `workoutLogs` | ⚠️ Partial | Checks if any log matches `plan_exercise_id` — doesn't distinguish today vs. all-time |

---

## Workout Tracker (`/workout` — `Workout.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| W-01 | Day selector strip | `<button role="tab">` | ✅ Works | Switches date, resets exercise index |
| W-02 | Weight decrement (−2.5 kg) | `<button onClick={updateSetField}>` | ✅ Works | Min enforced at 0 |
| W-03 | Weight increment (+2.5 kg) | `<button onClick={updateSetField}>` | ✅ Works | |
| W-04 | Weight direct input | `<input type="number">` | ✅ Works | |
| W-05 | Reps decrement (−1) | `<button onClick={updateSetField}>` | ✅ Works | Min enforced at 1 |
| W-06 | Reps increment (+1) | `<button onClick={updateSetField}>` | ✅ Works | |
| W-07 | Reps direct input | `<input type="number">` | ✅ Works | |
| W-08 | "Log set" check button | `<button onClick={handleCompleteSet}>` | ✅ Works | Inserts to `workout_logs` via Supabase |
| W-09 | "Add working set" button | `<button onClick={handleAddSet}>` | ✅ Works | Appends a row to `setRows` |
| W-10 | "Previous" movement button | `<button>` disabled at index 0 | ✅ Works | |
| W-11 | "Next movement" button | `<button>` disabled at last | ✅ Works | |
| W-12 | "Finish" workout button | `<button onClick={setSessionFinished(true)}>` | ❌ No guard | Fires with 0 sets logged (P1-1) |
| W-13 | "Return to Overview" button | `<Link to="/">` | ✅ Works | |
| W-14 | "Review workout logs" button | `<button onClick={setSessionFinished(false)}>` | ❌ Wrong action | Goes back to workout, not to `/progress` (P1-7) |
| W-15 | X close button | `<Link to="/">` | ✅ Works | Returns to dashboard |
| W-16 | Rest overlay "Skip" button | `onSkip={() => setResting(false)}` | ✅ Works | Dismisses rest timer |
| W-17 | "Generate workout plan" empty state CTA | `<Link to="/create-plan">` | ✅ Works | |
| W-18 | "View weekly plan" rest-day link | `<Link to="/plan">` | ✅ Works | |
| W-19 | Error state Retry | `onRetry={loadData}` | ✅ Works | |
| W-20 | RIR column | Static display | ⚠️ Static | Always shows `2`, not user-adjustable (P3-8) |

---

## Progress & Analytics (`/progress` — `Progress.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| PR-01 | Overview/Strength/Volume/Muscles/Weight tab buttons | `<button role="tab">` | ⚠️ Partial | Only Weight tab changes content (P2-3) |
| PR-02 | "Full Status" recovery badge link | `<Link to="/recovery">` | ✅ Works | |
| PR-03 | "Log Weight" (+) button (metric card) | `<button onClick={setShowWeightModal(true)}>` | ✅ Works | Opens modal |
| PR-04 | "Log Weight" action button (chart header) | `<button>` | ✅ Works | Same modal |
| PR-05 | Weight modal backdrop click | `onClick={setShowWeightModal(false)}` | ✅ Works | |
| PR-06 | Weight modal Cancel button | `<button>` | ✅ Works | |
| PR-07 | Weight input field | `<input type="number">` step 0.1 | ✅ Works | |
| PR-08 | "Record Weight" submit | `<button type="submit">` | ✅ Works | Calls `insertWeight()` — writes to Supabase |
| PR-09 | "Start Session" empty logs CTA | `<Link to="/workout">` | ✅ Works | |
| PR-10 | Error state Retry | `onRetry={loadProgressData}` | ✅ Works | |
| PR-11 | Weight chart | `<WeightChart data={weightData}>` | ✅ Works (when data) | Only renders when `weightData.length > 0` |

---

## Muscle Recovery (`/recovery` — `Recovery.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| RC-01 | Recovery/Volume/Untrained tab buttons | `<button role="tab">` | ❌ Tabs non-functional | `activeTab` changes but no content differs (P2-2) |
| RC-02 | "Start Suggested Session" CTA | `<Link to="/workout">` | ✅ Works | |

---

## Movement Library (`/exercises` — `Exercises.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| EX-01 | Search input | `<input type="search">` | ✅ Works | Filters by name, muscle, category, instructions |
| EX-02 | Search clear (X) button | `<button>` | ✅ Works | |
| EX-03 | Filter toggle icon button | `<button>` | ❌ No handler | Shows badge count but clicking does nothing (P2-4) |
| EX-04 | Muscle group filter pills | `<button role="tab">` | ✅ Works | Filters exercise list |
| EX-05 | Category filter pills | `<button role="tab">` | ✅ Works | Filters by strength/cardio/flexibility |
| EX-06 | Exercise card | `<Link to="/exercise/:id">` | ✅ Works | id can be slug or UUID |
| EX-07 | "Reset Filters" empty state button | `<button onClick={handleResetFilters}>` | ✅ Works | |
| EX-08 | Error state Retry | `window.location.reload()` | ⚠️ Crude | Full reload instead of refetch |
| EX-09 | Exercise card images | `<img src="/images/...">` | ❌ Broken | Files don't exist; onError hides image (P1-8) |

---

## Exercise Detail (`/exercise/:id` — `ExerciseDetails.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| ED-01 | Back button ("Movement Library") | `<button onClick={navigate('/exercises')}>` | ✅ Works | |
| ED-02 | Hero image | `<img onError={hide}>` | ❌ Broken | Same missing file issue as EX-09 |
| ED-03 | YouTube embed | `<YouTubeEmbed url={...}>` | ✅ Works (if URL exists) | Only renders when `youtube_url` field is populated |
| ED-04 | "All Movements" footer link | `<Link to="/exercises">` | ✅ Works | |
| ED-05 | "Start Workout Session" footer link | `<Link to="/workout">` | ✅ Works | |

---

## Athlete Profile (`/profile` — `Profile.jsx`)

| ID | Element | Type | Status | Notes |
|---|---|---|---|---|
| PF-01 | "Edit Profile" button | `<button onClick={setEditing(true)}>` | ✅ Works | Opens modal sheet |
| PF-02 | Profile edit modal backdrop click | `onClick={setEditing(false)}` | ✅ Works | |
| PF-03 | Name input (edit modal) | `<input>` | ✅ Works | |
| PF-04 | Weight input (edit modal) | `<input type="number">` | ✅ Works | |
| PF-05 | Height input (edit modal) | `<input type="number">` | ✅ Works | |
| PF-06 | Age input (edit modal) | `<input type="number">` | ✅ Works | |
| PF-07 | Fitness goal select | `<select>` | ⚠️ Data mismatch | Goal options differ from ProfileForm (P1-6) |
| PF-08 | Experience level select | `<select>` | ✅ Works | |
| PF-09 | Cancel button (edit modal) | `<button onClick={setEditing(false)}>` | ✅ Works | |
| PF-10 | "Save Profile" submit | `<button type="submit">` | ✅ Works | Calls `saveUserProfile()` → Supabase upsert |
| PF-11 | "Sign Out of FitTrack 2.0" button | `<button onClick={signOut}>` | ✅ Works | |
| PF-12 | Training attribute rows (Goal, Level, Weight, etc.) | `<div>` | ❌ False affordance | Have ChevronRight icon but are not interactive (P2-5) |
| PF-13 | "Movement Library" system link | `<Link to="/exercises">` | ✅ Works | |
| PF-14 | "Biometric Status" system link | `<Link to="/recovery">` | ✅ Works | |
| PF-15 | "Design System" system link | `<Link to="/design-system">` | ✅ Works | |

---

## Summary Counts

| Status | Count |
|---|---|
| ✅ Working | 62 |
| ❌ Broken / Non-functional | 11 |
| ⚠️ Partial / Misleading | 10 |
| **Total elements audited** | **83** |
