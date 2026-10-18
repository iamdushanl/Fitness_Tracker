# 1. FitTrack 2.0 Design Token Foundation (Phase 0)

Date: 2026-10-17  
Status: Accepted

## Context

The Fitness Tracker frontend (`frontend/`) is being upgraded to the FitTrack 2.0 design language exported from Figma Make (`fittrack-2-ui/`).

The prototype in `fittrack-2-ui` is a single monolithic `App.tsx` bundle with mock state, Tailwind v4 `@import "tailwindcss"`, and hardcoded data. In contrast, `frontend/` is an active production-grade React 19 application backed by real Supabase authentication, live database queries, and component-scoped Vanilla CSS stylesheets.

Copying Tailwind or Figma Make's `index.css` directly would cause global selector collisions and break existing pages. Additionally, 23 component stylesheets in `frontend/` depend on 25 CSS custom properties (such as `--primary`, `--border`, `--text-primary`, `--radius-md`, etc.).

## Decision

1. **Token Extraction & Modernization**:
   - Replaced `:root` variables in [`frontend/src/index.css`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/src/index.css) with canonical FitTrack 2.0 design tokens:
     - Color palette: Olive-dark surfaces (`--bg: #0b0d0c`, `--surface: #141715`, `--line: rgba(...)`), electric lime accents (`--accent: #b9f34b`, `--accent-strong: #9edc2d`, `--accent-ink: #132000`, `--accent-alpha: rgba(...)`), and semantic indicators (`--amber`, `--cool`, `--danger`).
     - Typography: DM Sans for body/UI (`--sans`) and Instrument Serif for hero headings (`--serif`).
     - Radii: 2.0 smooth scales (`--radius-sm: 12px`, `--radius: 20px`, `--radius-lg: 28px`, `--radius-full: 999px`).
     - Shadows & Motion: `--shadow`, `--shadow-sm/md/lg`, and `--ease-out-quart`.
2. **Backward-Compatible Legacy Aliases**:
   - Preserved all 25 legacy CSS custom properties in `:root` mapped directly to their 2.0 equivalents (e.g. `--primary: var(--accent)`, `--border: var(--line)`, `--font-body: var(--sans)`, `--font-heading: var(--serif)`, `--radius-md: var(--radius)`).
   - Retained component-specific tokens (`--font-xs`, `--text-muted`, `--transition-fast`) so that no existing component `.css` file requires modification during Phase 0.
3. **Typography & Icon Integration**:
   - Loaded DM Sans and Instrument Serif via Google Fonts `@import` and added DNS/TLS preconnect links in [`frontend/index.html`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/index.html).
   - Installed `lucide-react` (v1.59.0) in [`frontend/package.json`](file:///c:/Users/HP/Documents/fitness-tracker-starter/frontend/package.json) for subsequent component migrations.
4. **Boundary Isolation**:
   - Figma Make's `App.tsx`, mock authentication, Tailwind v4 imports, and Figma-specific Vite plugins were strictly excluded.

## Consequences

- **Zero Breaking Changes**: All existing routes, pages, and components render cleanly with the new 2.0 aesthetic without any component code modification.
- **Production Build Integrity**: `npm run build` (Vite 8.2) bundles cleanly in < 500ms and `oxlint` passes with 0 errors and 0 warnings.
- **Foundation for Phase 1**: With tokens and `lucide-react` in place, Phase 1 can now build the structural navigation (`Sidebar`, `BottomNav`, `Topbar`) cleanly.
- **Follow-up Maintenance**: As components are refactored in Phases 1 through 6, legacy aliases will be replaced with canonical tokens and eventually deprecated.
