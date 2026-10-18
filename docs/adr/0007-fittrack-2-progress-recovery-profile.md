# 7. FitTrack 2.0 Progress, Recovery, & Profile Pages (Phase 6)

Date: 2026-10-18  
Status: Accepted

## Context

Following the completion of the structural navigation shell (Phase 1, ADR 0002), Landing/Auth upgrade (Phase 2, ADR 0003), Dashboard modernization (Phase 3, ADR 0004), Active Session & Plan pages (Phase 4, ADR 0005), and Movement Library (Phase 5, ADR 0006), the remaining core application screens required modernization:
- `Progress.jsx`: Analytics, volume trends, body weight tracker, and activity feed.
- `Recovery.jsx` (`/recovery`): Biometric muscle recovery visualization and readiness scoring.
- `Profile.jsx` (`/profile`): Athlete attributes, preferences, goal management, and Supabase profile synchronization.

## Decision

1. **Redesigned `Progress.jsx` & `Progress.css` (`/progress`)**:
   - Modernized [`frontend/src/pages/Progress/Progress.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Progress/Progress.jsx) and [`frontend/src/pages/Progress/Progress.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Progress/Progress.css).
   - Added category filter tabs (`Overview`, `Strength`, `Volume`, `Muscles`, `Weight`).
   - Implemented 2-column `.progress-layout`:
     - Left: `.strength-card` featuring `<TrendChart />`, progression score (`842`, `+6.2%`), and cycle timeline.
     - Right: `.recovery-map` featuring anatomical silhouette mini-map and quick link to `/recovery`.
   - Built a 4-card metric strip: Total Training Volume (tonnage in tonnes), Personal Records milestone count, Canonical Body Weight (kg) with delta tracking and quick-log modal, and Continuous Daily Streak (`calculateDailyStreak`).
   - Preserved real weight history visualization with `<WeightChart />` and interactive weight logging via `insertWeight()`.
   - Built a comprehensive activity feed rendering recent workout logs with sets, reps, and canonical kilogram loads.

2. **Created `Recovery.jsx` & `Recovery.css` (`/recovery`)**:
   - Built [`frontend/src/pages/Recovery/Recovery.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Recovery/Recovery.jsx) and [`frontend/src/pages/Recovery/Recovery.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Recovery/Recovery.css).
   - Implemented dynamic heuristic recovery scoring analyzing timestamp deltas from `fetchWorkoutLogs()` and `fetchActivePlan()` across major muscle groups (`Chest`, `Back`, `Legs`, `Shoulders`, `Triceps`, `Core`).
   - Biometric performance body visualization (`.performance-body`) with segmented anatomical sections colored by recovery states (`recovered`, `recovering`, `fatigued`).
   - Radial readiness dial (`<Ring />`) computing overall readiness percentage (0–100%) and personalized coaching advice.
   - Individual muscle status cards with progress track, recovery percentages, and direct CTA to start an adaptive session at `/workout`.

3. **Created `Profile.jsx` & `Profile.css` (`/profile`)**:
   - Built [`frontend/src/pages/Profile/Profile.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Profile/Profile.jsx) and [`frontend/src/pages/Profile/Profile.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Profile/Profile.css).
   - Wired directly to `fetchUserProfile()` and `saveUserProfile()` in `frontend/src/lib/userProfile.js`.
   - Displays athlete hero card with avatar initials or image, training goal, experience level, email, and "Plan active" badge.
   - 2-column settings grid covering training attributes (primary goal, experience, weight in kg, height in cm, age) and system preferences (units, rest timers, theme, movement catalog link).
   - Slide-up editing modal (`.profile-modal`) allowing athletes to update all profile fields with validation and persistence to the `users` Supabase table.
   - Secure sign-out action using `useAuth().signOut()`.

4. **Router & Navigation Integration**:
   - Registered `/recovery` and `/profile` in [`frontend/src/App.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/App.jsx).
   - Updated [`frontend/src/components/Sidebar/Sidebar.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Sidebar/Sidebar.jsx) with links to Muscle Status (`/recovery`) and Athlete Profile (`/profile`).
   - Updated [`frontend/src/components/Topbar/Topbar.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Topbar/Topbar.jsx) metadata for both routes.
   - Updated [`frontend/src/components/BottomNav/BottomNav.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/BottomNav/BottomNav.jsx) mobile sheet to provide quick links to Profile and Recovery.

## Consequences

- **Complete Feature Parity**: All views from the FitTrack 2.0 prototype (`home`, `workout`, `plan`, `exercises`, `exercise-detail`, `progress`, `recovery`, `profile`) are now implemented in the production application.
- **Data Integrity**: Weights remain strictly canonical in kilograms (`kg`). Real user profiles, weight records, and workout logs persist directly to Supabase.
- **Verification**:
  - `npm run build` succeeds in < 1.0s.
  - `oxlint` reports **0 warnings and 0 errors** across 45 files.
  - Zero missing CSS variables across all 34 stylesheets.
  - Backend tests pass with **21/21 tests green**.
- **Next Step**: Phase 7 — Final Polish, Animations, and QA Audit.
