# 4. FitTrack 2.0 Dashboard Redesign (Phase 3)

Date: 2026-10-17  
Status: Accepted

## Context

Following the completion of the structural navigation shell (Phase 1, ADR 0002) and Landing / Auth upgrade (Phase 2, ADR 0003), the primary authenticated interface ([`frontend/src/pages/Dashboard/Dashboard.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Dashboard/Dashboard.jsx)) required modernization to the FitTrack 2.0 `HomeView` standard.

The legacy dashboard was built with a simple horizontal summary row, individual streak/weight cards, and a vertical list of `WorkoutCard` components. FitTrack 2.0 defines an editorial, high-density performance grid:
- Status strip highlighting readiness and active streak.
- Hero workout card powered by `<PerformanceVisual />` with exercise counts, working sets, and direct "Start workout" CTA.
- 7-day calendar strip (Monday through Sunday) reflecting completed, planned, and active workouts with weekly goal progress.
- Recent personal best highlight card (`Trophy`).
- Secondary readiness column with dynamic conic gauge (`<Ring />`), recovery muscle volume bars, streak (`Flame`), body weight (`Weight`), and mini strength trend chart (`<TrendChart />`).
- Full mobile-first responsive layout that gracefully stacks insights on screens $\le 768\text{px}$.

All data queries (`fetchUserProfile`, `fetchWeightHistory`, `fetchActivePlan`, `fetchWorkoutLogs`), business math (`calculateDailyStreak`), and async state screens (`StateScreen`) had to remain strictly intact and authoritative.

## Decision

1. **Extracted Modular Subcomponents**:
   - [`Ring.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Ring/Ring.jsx): Conic-gradient radial dial calculating readiness percentages dynamically based on streak and workout frequency.
   - [`TrendChart.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/TrendChart/TrendChart.jsx): Responsive SVG vector performance curve with accented area gradient and active endpoint indicator.
   - Reusable `SectionHeading` with integrated navigational action links (`Link`).
2. **Preserved Authoritative Supabase Data Verbatim**:
   - Preserved `Promise.all` data pipeline fetching profile, weight history, active plan, and workout logs.
   - Preserved `calculateDailyStreak()` for continuous streak computation.
   - Dynamically mapped plan exercises and logged exercises into the 2.0 `HomeView` DOM structure without modifying data models.
3. **Responsive Grid Architecture**:
   - Built a 2-column asymmetric desktop grid (`minmax(0, 1.6fr) minmax(320px, 0.8fr)`).
   - Designed a dedicated `.mobile-only.mobile-insights` block for viewports $\le 768\text{px}$, cleanly stacking momentum cards and the 7-day calendar without layout shifts or horizontal scroll.
4. **Boundary Isolation & Legacy Protection**:
   - Preserved existing component files ([`WorkoutCard`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/WorkoutCard/), [`ProgressSummary`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/ProgressSummary/), [`WeightCard`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/WeightCard/), [`StreakCard`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/StreakCard/)) to avoid breaking unmigrated route references.
   - Retained `StateScreen` for loading and error states.

## Consequences

- **Stunning Athlete Experience**: Users are greeted with a high-performance, dark olive dashboard with editorial typography and real-time visual progress.
- **Flawless Data Continuity**: Streaks, weights, plan routines, and workout history match real Supabase tables with zero discrepancy.
- **Production Validation**: `npm run build` succeeds in < 1s; `oxlint` passes with 0 warnings and 0 errors across 40 files.
- **Ready for Phase 4**: The project is now positioned for **Phase 4: Workout + Plan Pages** (`Workout.jsx` active session layout, set stepper UI, and dedicated `/plan` route).
