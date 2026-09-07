# Known Issues & Future Technical Debt (KNOWN-ISSUES.md)

This document honestly catalogs known limitations, intentional trade-offs, and future work across the **FitTrack** repository.

> **Philosophy:** *Honesty beats a hidden landmine.* Documenting architectural boundaries clearly allows reviewers and future developers to make informed decisions without unexpected surprises.

---

## 1. Recently Resolved "Fix Later" Items

The following small deferred items have been addressed and closed:
- [x] **Dynamic Daily Streak Calculation:** Replaced hardcoded `const streak = 4;` with a live client-side streak calculator (`frontend/src/lib/streak.js`) that analyzes actual timestamps from `workout_logs`.
- [x] **Vite Fast Refresh & Context Separation:** Extracted React context definitions and custom hook (`useAuth`) into dedicated non-component files to guarantee hot-module replacement and eliminate all Fast Refresh warnings.
- [x] **Synchronous State In Effects:** Eliminated synchronous state updates on component mount across Dashboard, Workout, and Progress pages.
- [x] **YouTube Ad-Blocker Fallback:** Added direct fallback links ("Watch on YouTube ↗") alongside embedded iframes in case browser privacy shields block Google/YouTube embeds.
- [x] **Dead Mock Data Removal:** Permanently purged unused Week 4 mock data and starter assets.

---

## 2. Open Limitations & Roadmap Items (v1 Trade-offs)

### 1. Historical Multi-Week Completion Trend (W1–W4) on Frontend
- **Current Behavior:** The completion rate chart on the `<Progress />` screen displays baseline points for W1–W4 alongside the user's active, dynamically-computed current week rate (W5).
- **Reason:** Aggregating multi-week historical performance across monthly/annual plan boundaries requires cross-plan volume comparisons that belong authoritatively on the server.
- **Path Forward:** Wire the frontend Progress screen to the backend `GET /progress/summary` endpoint during the AWS cloud deployment phase.

---

### 2. Automated Sunday-Night Adaptation Trigger
- **Current Behavior:** The workout plan adaptation rules (±10% volume, 0.5×–1.5× initial guardrails, and missed-week nudges) are specified in `docs/SPEC.md` and `docs/ARCH.md`, but automated Sunday 23:00 UTC execution does not run as a standing daemon on local developer machines.
- **Reason:** Continuous background schedulers require an always-on production runtime (AWS App Runner or AWS EventBridge scheduled task) rather than transient local dev servers.
- **Path Forward:** Implement the background cron worker or AWS EventBridge cron rule in Week 11 when deploying the containerized backend to AWS.

---

### 3. Single Active Plan Lifecycle
- **Current Behavior:** Users maintain one active 7-day workout plan at a time. Submitting the onboarding form on `/create-plan` creates a new active plan.
- **Reason:** v1 intentionally simplifies the data flow to a single active 7-day loop.
- **Path Forward:** Add a historical plan archive and selector in v2 to allow users to review past multi-week training blocks.

---

### 4. Metric-Only Measurements (No Imperial Toggle)
- **Current Behavior:** Height and weight inputs and displays are strictly in centimeters (`cm`) and kilograms (`kg`).
- **Reason:** Explicit non-goal for v1 (SPEC §4) to maintain consistency across volume calculations and avoid unit-conversion rounding bugs in early database schemas.
- **Path Forward:** Add an account preference toggle (`metric` vs. `imperial`) in user settings with client-side conversion utilities in v2.

---

### 5. Third-Party Video Embed Sandboxing & Privacy Extensions
- **Current Behavior:** Strict content blockers or privacy browsers (e.g. Brave Shields, Privacy Badger, uBlock Origin) may occasionally block YouTube iframe embeds.
- **Mitigation:** Every exercise guidance view provides a direct external "Watch on YouTube ↗" link beneath the embed container so users can always access the video.

---

### 6. Local Environment Setup Dependency
- **Current Behavior:** To run with full database functionality locally, developers must populate their own Supabase project URL and keys in `frontend/.env.local` and `backend/.env`.
- **Reason:** No secrets are committed to Git history (by design, per `docs/CONFIG_AND_SECRETS.md`).
- **Mitigation:** Clear instructions and template files (`.env.example`, `backend/.env.example`, `frontend/.env.example`) are provided in the repo root.
