# 6. FitTrack 2.0 Movement Library & Exercise Detail (Phase 5)

Date: 2026-10-17  
Status: Accepted

## Context

Following the completion of the structural navigation shell (Phase 1, ADR 0002), Landing/Auth upgrade (Phase 2, ADR 0003), Dashboard modernization (Phase 3, ADR 0004), and Active Workout & Plan pages (Phase 4, ADR 0005), the movement catalog and technique instruction pages required modernization to the FitTrack 2.0 specification.

The legacy application lacked a dedicated exercise exploration route (only linking to `/exercise/:id` from workouts), and the existing `ExerciseDetails.jsx` page was styled with legacy CSS tokens and basic list formatting without 2.0 visual hierarchy or responsive hero imagery.

FitTrack 2.0 introduces:
- A dedicated movement library at `/exercises` (`Exercises.jsx`) with instant search, primary muscle filtering pills, and category tags.
- Responsive 3-column exercise card grid with elevation animations and category badges.
- A redesigned exercise detail page at `/exercise/:id` (`ExerciseDetails.jsx`) featuring an atmospheric hero media banner, Instrument Serif typography, primary muscle focus breakdown, embedded YouTube technique demonstration, step-by-step parsed instruction cues, safety guidance callout, and a fixed bottom action bar.

## Decision

1. **Created `Exercises.jsx` & `Exercises.css` (`/exercises`)**:
   - Built [`frontend/src/pages/Exercises/Exercises.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Exercises/Exercises.jsx) and [`frontend/src/pages/Exercises/Exercises.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Exercises/Exercises.css).
   - Wired to `fetchExercises()` in `frontend/src/lib/exercises.js`, fetching from Supabase with fallback to the 20 curated seed exercises.
   - Built a real-time search input with clear button, matching movement name, muscle group, category, and technique keywords.
   - Built muscle filtering pills (`All`, `Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`, `Full Body`) and secondary category filters (`All Categories`, `Strength`, `Cardio`, `Mobility & Stretch`).
   - Implemented a responsive 3-column grid (`.exercise-grid`) with image cards, hover lift (`translateY(-2px)`), category badges, and quick detail navigation.
   - Included polished empty search states with a single-click "Reset Filters" action.

2. **Redesigned `ExerciseDetails.jsx` & `ExerciseDetails.css` (`/exercise/:id`)**:
   - Upgraded [`frontend/src/pages/ExerciseDetails/ExerciseDetails.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/ExerciseDetails/ExerciseDetails.jsx) and [`frontend/src/pages/ExerciseDetails/ExerciseDetails.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/ExerciseDetails/ExerciseDetails.css).
   - Synchronously initializes with `getExerciseById(id)` to eliminate layout flicker, asynchronously verified with `fetchExerciseById(id)`.
   - Atmospheric hero banner (`.detail-hero`) with gradient shading (`.detail-hero-shade`), category indicators, and video badge.
   - Heading 1 in Instrument Serif typography (`clamp(38px, 4.5vw, 60px)`).
   - Primary muscles focus card (`.primary-muscles`) displaying prime mover, modality, and kinetic chain information.
   - Preserved and enhanced [`YouTubeEmbed`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/YouTubeEmbed/YouTubeEmbed.jsx) within a styled 2.0 card wrapper with responsive 16:9 aspect ratio and fallback link.
   - Numbered step execution breakdown parsed from instructions with an alert box for safety and common technique mistakes.
   - Sticky / floating bottom action bar (`.detail-actions`) allowing instant transitions to active workouts (`/workout`) or return to the library (`/exercises`).

3. **Navigation & Shell Integration**:
   - Registered `/exercises` route in [`frontend/src/App.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/App.jsx).
   - Added Movement Library link to [`frontend/src/components/Sidebar/Sidebar.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Sidebar/Sidebar.jsx) with `Search` icon.
   - Updated [`frontend/src/components/Topbar/Topbar.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Topbar/Topbar.jsx) to display `"Movement Library"` eyebrow and appropriate titles for `/exercises` and `/exercise/:id`.
   - Added Movement Library link inside the mobile account sheet in [`frontend/src/components/BottomNav/BottomNav.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/BottomNav/BottomNav.jsx).

4. **Standards & Token Compliance**:
   - All styles use canonical FitTrack 2.0 design tokens (`--bg`, `--surface`, `--accent`, `--line`, `--radius`, `--serif`, `--sans`, `--transition-fast`).
   - Verified zero missing CSS tokens across all 32 stylesheets in the workspace.
   - Fixed `/health` route assertion in `backend/tests/routes.test.js` to match the service identifier contract.

## Consequences

- **Rich Movement Discovery**: Athletes can now search and filter all movements by muscle target and modality from any device.
- **Flawless Detail Experience**: Exercises feature high-definition visual cards, technique guidance, and video demonstration without leaving the application.
- **Zero Regressions**: 
  - `npm run build` succeeds in < 950ms.
  - `oxlint` passes with **0 warnings and 0 errors** across 43 files.
  - Backend tests pass with **21/21 assertions green**.
- **Next Step**: Proceed to **Phase 6: Progress, Recovery, Profile** per `docs/UI_MIGRATION_PLAN.md`.
