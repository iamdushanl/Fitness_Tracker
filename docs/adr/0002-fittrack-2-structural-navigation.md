# 2. FitTrack 2.0 Structural Navigation Shell (Phase 1)

Date: 2026-10-17  
Status: Accepted

## Context

Following the completion of the design token foundation (Phase 0, ADR 0001), the application required a responsive navigation shell aligned with FitTrack 2.0's UX architecture.

The legacy application used a single horizontal `<Navbar />` with emoji icons and a fixed `page-container`. FitTrack 2.0 requires:
- A desktop fixed/sticky sidebar (~248px wide) with brand badge, navigation links, adaptive coach card, and athlete profile access.
- A sticky topbar with dynamic route titles and notification/account actions.
- A 5-target touch-friendly mobile bottom navigation bar with safe-area padding.
- Strict preservation of real Supabase authentication, session guards, and live route destinations (`/`, `/create-plan`, `/workout`, `/exercise/:id`, `/progress`).
- Prevention of broken/blank routes for destinations not yet migrated.

## Decision

1. **Created Component Architecture**:
   - [`Sidebar`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Sidebar/Sidebar.jsx): 248px desktop fixed sidebar featuring the 2.0 tilted lime badge logo, primary React Router `<NavLink>` targets with active indicator dots, an adaptive coach card, and user profile / sign-out footer.
   - [`Topbar`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/Topbar/Topbar.jsx): Sticky header atop the main content area with dynamic route metadata (eyebrow and editorial serif title determined by `useLocation()`), notification bell, and user avatar popover menu.
   - [`BottomNav`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/components/BottomNav/BottomNav.jsx): Fixed mobile bottom bar (`max-width: 768px`) with 5 targets: Home (`/`), Workout (`/workout`), Plan (`/create-plan`), Progress (`/progress`), and Profile (which opens an accessible mobile account sheet).
2. **Preventing Broken Route Destinations**:
   - Instead of routing to a blank or mock `/profile` page, the mobile 5th target opens an account bottom-sheet with the athlete's metadata, plan status, and sign-out action.
   - Added a router alias for `/plan` that redirects to `/create-plan`, ensuring no broken 404s or blank screens occur if users navigate to `/plan`.
3. **Layout & Responsive Offset**:
   - Introduced `.app-shell`, `.main-panel`, and `.content-area` layout utilities in [`index.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/index.css).
   - Desktop: `.main-panel` offset by `248px` (scales to `210px` on tablet); `.sidebar` visible; `.bottom-nav` hidden.
   - Mobile: `.sidebar` hidden; `.main-panel` has `margin-left: 0; padding-bottom: calc(74px + env(safe-area-inset-bottom))`; `.bottom-nav` rendered with safe-area inset padding.
   - Content and workout inputs are protected against bottom-nav obstruction.
4. **Accessibility & Motion**:
   - Semantic `<aside>`, `<nav>`, `<header>`, and `<main>` tags.
   - High-contrast `:focus-visible` rings using `var(--accent)`.
   - Comprehensive `@media (prefers-reduced-motion: reduce)` support across all new components.
   - Accessible labels on icon buttons (`aria-label`, `aria-modal`, `aria-expanded`).
5. **Code Isolation & Legacy Preservation**:
   - Preserved `frontend/src/components/Navbar/` to avoid breaking unmigrated references.
   - Preserved all Supabase auth logic and backend routes.

## Consequences

- **Fluid Responsive Experience**: Users experience the modern FitTrack 2.0 desktop sidebar and mobile bottom bar without layout shifts or horizontal scrollbars.
- **Production Validation**: `npm run build` succeeds cleanly in < 900ms and `oxlint` passes with 0 warnings and 0 errors across 37 files.
- **Zero Missing Tokens**: Verified that all 40 unique CSS variables referenced across the codebase resolve cleanly.
- **Ready for Phase 2**: The structural container is in place to begin view-specific upgrades (Phase 2: Landing / Auth redesign; Phase 3: Dashboard redesign) without navigation refactoring.
