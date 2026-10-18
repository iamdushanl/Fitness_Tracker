# 3. FitTrack 2.0 Landing & Auth Redesign (Phase 2)

Date: 2026-10-17  
Status: Accepted

## Context

Following the completion of the structural navigation shell (Phase 1, ADR 0002), the unauthenticated entry screen ([`frontend/src/pages/Landing/Landing.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/pages/Landing/Landing.jsx)) required modernization to the FitTrack 2.0 visual and UX standard.

The legacy landing page was a simple single-column card layout with basic emoji bullets and an isolated sign-in button. FitTrack 2.0 introduces an editorial, split-screen atmosphere featuring an SVG athletic performance visual on the left, and a sliding authentication shell (Login $\leftrightarrow$ Register) on the right.

Crucially, real Supabase OAuth authentication, session persistence, and error handling had to remain strictly intact with zero backend or auth schema alterations.

## Decision

1. **Created `PerformanceVisual` Vector Component**:
   - Extracted and ported [`PerformanceVisual.jsx`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/PerformanceVisual/PerformanceVisual.jsx) and [`PerformanceVisual.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/PerformanceVisual/PerformanceVisual.css).
   - Includes glassmorphic gradients (`bodyGlass`, `bodyEdge`, `glassRibbon`, `energyLine`), orbiting rings (`.orbit-one`, `.orbit-two`), floating particle field, and organic keyframe animations (`athlete-breathe`, `energy-drift`, `energy-flow`, `particle-float`).
   - Integrated full `@media (prefers-reduced-motion: reduce)` support.
2. **Replaced `Landing.jsx` with 2.0 Split-Screen `AuthView`**:
   - **Left Visual Panel**: Renders `<PerformanceVisual />`, brand heading in Instrument Serif ("Move with purpose. *Progress with clarity.*"), system tagline, and floating "Recovery readiness 78%" indicator.
   - **Right Slidable Shell**: Smooth animated track (`transform: translateX(-50%)`) toggling between Login and Register states.
   - **Authentication Binding**: Connected "Continue with Google" directly to `useAuth().signInWithGoogle()`. Form submission triggers visual feedback and seamless Google OAuth initialization.
   - **Interactive Form Elements**: Tab switcher for Email vs Phone, password visibility toggle (`Eye` / `EyeOff`), and Terms agreement checkbox.
3. **Mobile Adaptability**:
   - At viewports $\le 768\text{px}$, the visual panel transitions into a subtle, low-opacity ambient background (`opacity: 0.35`) with dark gradient scrims.
   - The auth shell adapts to 100% width with centered mobile logo and safe-area padding.
4. **Boundary Isolation**:
   - Written in Vanilla CSS using canonical FitTrack 2.0 design tokens.
   - No mock auth state or Tailwind CSS leaked into `frontend/`.

## Consequences

- **Modern First Impression**: Unauthenticated visitors immediately experience the FitTrack 2.0 brand identity and aesthetic excellence without compromising load performance.
- **Production Build & Lint Clean**: `npm run build` completes in < 1s; `oxlint` reports 0 warnings and 0 errors across 38 files.
- **Preserved Auth Integrity**: Google OAuth flow and session persistence continue to work seamlessly through Supabase.
- **Ready for Phase 3**: With the outer shell and unauthenticated entry completely modernized, the project is ready for **Phase 3: Dashboard Redesign** (`HomeView`).
