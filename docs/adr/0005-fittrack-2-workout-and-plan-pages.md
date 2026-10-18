# 5. FitTrack 2.0 Workout Session & Plan Pages (Phase 4)

Date: 2026-10-17  
Status: Accepted

## Context

Following the completion of the structural navigation shell (Phase 1, ADR 0002), Landing / Auth upgrade (Phase 2, ADR 0003), and Dashboard modernization (Phase 3, ADR 0004), the active training tracking and routine planning experiences required modernization to the FitTrack 2.0 standard.

The legacy `Workout.jsx` page was structured around vertical card lists and modal logging forms (`WorkoutLogForm`). FitTrack 2.0 introduces:
- A dedicated active workout session screen with exercise visual panel, progress indicator, and set-row stepper UI.
- Automatic rest interval timing with fullscreen `RestOverlay` countdown and quick time extension controls (+15s / +30s).
- Direct persistence of sets via `insertWorkoutLog` storing canonical kilograms.
- A dedicated weekly schedule inspection page at route `/plan` (`Plan.jsx`) displaying the 7-day planner grid, daily routine movements, target sets/reps/loads, and recovery days.

## Decision

1. **Created `RestOverlay` Component**:
   - Extracted [`RestOverlay.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/RestOverlay/RestOverlay.jsx) and [`RestOverlay.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/RestOverlay/RestOverlay.css).
   - Features a high-contrast timer display, continuous progress indicator, `+15 sec` and `+30 sec` extensions, and an accessible "Skip rest" button with ESC key support.
   - Previews the next upcoming exercise movement.
2. **Created Dedicated `Plan.jsx` Page at `/plan`**:
   - Built [`Plan.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Plan/Plan.jsx) and [`Plan.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Plan/Plan.css) wired directly to `fetchActivePlan()`.
   - Displays a 7-day calendar grid (Monday through Sunday) with status tags (`complete`, `today`, `planned`, `rest`).
   - Interactive routine builder inspecting movements, targets, sets $\times$ reps, and kilograms.
   - Provides an empty state card with a direct call to action to `/create-plan` if no routine is scheduled.
3. **Redesigned `Workout.jsx` Active Session**:
   - 2-column layout:
     - Left: Movement visual container with `<PerformanceVisual />`, movement count badge (`Exercise X / Y`), and equipment tags.
     - Right: Current exercise title, target metrics, progression cue, and `<div className="card set-card">`.
   - Set-row stepper UI allowing athletes to adjust load in kilograms and rep targets with `+`/`−` controls or direct number input.
   - Checkmark logging action calling `insertWorkoutLog` immediately and triggering `<RestOverlay>`.
   - Dynamic session progress bar tracking sets completed vs programmed.
4. **Router & Navigation Updates**:
   - Updated [`App.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/App.jsx) to route `/plan` to `<Plan />` while preserving `/create-plan` for plan generation.
   - Updated [`Sidebar.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Sidebar/Sidebar.jsx) and [`BottomNav.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/BottomNav/BottomNav.jsx) to link to `/plan`.
5. **Business Rules Adherence**:
   - Weights remain stored in canonical **kilograms (`kg`)**.
   - No modifications to database schemas or Supabase RLS policies.
   - Retained legacy components ([`ExerciseCard`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/ExerciseCard/), [`WorkoutLogForm`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/WorkoutLogForm/), [`DaySelector`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/DaySelector/)) to ensure backwards compatibility.

## Consequences

- **Fluid Gym Experience**: Athletes can seamlessly log sets with one tap, track progression, and time rests without leaving the flow.
- **Production Integrity**: `npm run build` bundles in < 900ms; `oxlint` passes with 0 warnings and 0 errors across 42 files.
- **Ready for Phase 5**: The core workout and planning loops are now fully modernized, leaving **Phase 5: Exercises Library + Exercise Detail** as the next step.
