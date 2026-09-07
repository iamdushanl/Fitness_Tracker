# SPEC.md — Personal Fitness Tracker

> **This is your plan, in plain words.** Fill in every section below _before_ you ask an AI agent to build anything.
> A good spec answers "what and why"; it does **not** describe code. Keep it short, clear and honest.
> Delete the italic prompts as you replace them with your own answers.

---

## 1. One-line summary

An adaptive fitness web app that creates personalized workout schedules from a user's physical information and fitness goal, tracks their actual performance, and adjusts future workouts based on their progress.

## 2. The people (users)

- **Primary user:**
  A person who wants to achieve a personal fitness goal through a structured workout plan but needs guidance and adaptation based on their actual performance.

- **What they want:**
  1. Receive a workout schedule appropriate for their goal.
  2. Know how to perform each exercise correctly.
  3. Record what they actually completed.
  4. See whether they're progressing toward their target.
  5. Have future workouts adjusted according to their progress.

- **What would make them stop using it:**
  1. The schedule feels random or irrelevant.
  2. Exercise instructions are unclear.
  3. The system doesn't adapt when they repeatedly fail to complete workouts.
  4. The app doesn't acknowledge their progress.
  5. It feels like a chore rather than a helpful tool.

## 3. Core features (v1)

1. **Personalized workout planning** — Generate a weekly workout schedule from a static lookup table keyed on fitness goal and experience level (4 goals × 3 levels = 12 templates).
2. **Workout completion tracking** — Record sets × reps × weight (strength) or duration × distance (cardio) per exercise, compared against prescribed targets.
3. **Progress monitoring** — Display a weekly completion-rate trend (% of prescribed volume completed), current weight vs. starting weight, and workout streak.
4. **Adaptive workout scheduling** — At the end of each week, auto-adjust next week's targets using a simple rule-based heuristic (see §5a).
5. **Exercise guidance** — Show text instructions and an embedded YouTube video for each exercise from a curated seed library of ~20 exercises.

## 4. Non-goals (out of scope for v1)

- Camera-based exercise form analysis
- Live personal trainer / human coaching
- Wearable integration (Apple Watch, Garmin, etc.)
- Food/nutrition tracking
- AI / ML-based plan generation (v1 uses static lookup tables)
- Periodization, deload cycles, or advanced programming
- Self-hosted exercise videos (v1 links to YouTube)
- Unit system toggle (v1 is metric-only: cm / kg)

## 5. The data

- **User profile:** name, age, height (cm), weight (kg), experience level (beginner / intermediate / advanced), fitness goal (enum — see below)
- **Fitness Goal (enum):** `weight_loss` · `muscle_gain` · `general_fitness` · `endurance`
- **Exercise (seed library, ~20 total):** name, category (strength / cardio / flexibility), muscle group, instructions (text), YouTube demo URL
  - 10 strength — e.g. squat, bench press, deadlift, overhead press, barbell row, lunge, bicep curl, tricep extension, plank, lat pulldown
  - 6 cardio — e.g. running, cycling, jump rope, rowing, stair climbing, brisk walking
  - 4 flexibility — e.g. hamstring stretch, hip flexor stretch, shoulder stretch, cat-cow
  - Each exercise ships with manually-written instructions and a vetted public YouTube URL. Broken-link detection is a v2 concern.
- **Workout Plan:** a weekly schedule of workout days; each day lists exercises with prescribed sets, reps, weight (strength) or duration, distance (cardio)
- **Workout Log:** per exercise — prescribed targets vs. actual completed (sets × reps × weight **or** duration × distance), date, optional notes
- **Progress Snapshot:** weekly completion rate (%), current weight (user-entered), streak (consecutive weeks with ≥ 1 logged workout)

### 5a. Adaptation rules (v1 heuristic)

The system recalculates the next week's plan every **Sunday night** (or when the user manually requests it), using these rules:

| Condition                                                  | Action                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| Weekly completion rate ≥ 90%                               | Increase next week's targets by 10% (more reps, weight, or duration) |
| Weekly completion rate 60–89%                              | Keep targets the same                                                |
| Weekly completion rate 30–59%                              | Decrease next week's targets by 10%                                  |
| Weekly completion rate < 30% **or** user logged 0 workouts | Keep current targets, show an encouragement nudge                    |

**Guardrails:**

- Targets never increase beyond **1.5×** the initial plan values.
- Targets never decrease below **0.5×** the initial plan values.
- If a user misses **3 consecutive weeks** (completion < 30%), prompt them to update their goal or profile rather than silently adjusting.

**Initial plan generation:** The first schedule is pulled from a static lookup table organized by `(fitness_goal, experience_level)`. Each combination maps to a pre-authored 7-day template. 4 goals × 3 levels = **12 templates**, each containing 3–5 workout days.

> This heuristic is intentionally simple. It is designed to be demoable and testable in v1. More sophisticated models (periodization, deload weeks, etc.) are v2.

## 6. Sign-in

This app uses Google (Gmail) login via Supabase Auth (`@supabase/supabase-js`).

- **What can a signed-out visitor see?**
  1. The public landing page (`<Landing />`) with brand presentation, key feature cards, and value proposition.
  2. Clear call-to-action button ("Sign in with Google") to initiate OAuth redirect.
  3. No private user data, workouts, logs, or profile information are exposed or queryable without an active session.

- **What is private to the signed-in user?**
  1. User profile and physical metrics (`users` table).
  2. Workout plans and scheduled daily exercises (`workout_plans`, `plan_exercises`).
  3. Historical workout performance logs (`workout_logs`) and weigh-in trends (`weight_history`).
  4. Authoritative weekly completion metrics and streaks.

---

## 7. Key user journeys

1. **Create my workout plan:**
   Sign in with Google
   → Enter name, age, height (cm), weight (kg)
   → Select experience level (beginner / intermediate / advanced)
   → Select fitness goal (weight loss / muscle gain / general fitness / endurance)
   → Submit
   → System matches the 12-template lookup table for the selected goal & level
   → Inserts user profile, weight record, workout plan, and 7-day scheduled plan exercises into Supabase with immutable `initial_target_*` baseline columns
   → Displays the 7-day schedule with prescribed exercises and targets
   → User can browse each exercise's text instructions and embedded YouTube demo video

2. **Complete and record a workout:**
   Open today's workout on the Workout screen
   → See the list of prescribed exercises with target sets, reps, weight, duration, or distance
   → Select an exercise to view text instructions and responsive YouTube demonstration video
   → Perform the exercise
   → Enter actual results in `WorkoutLogForm`: sets × reps × weight (strength) **or** duration × distance (cardio)
   → Save → Exercise log is persisted to Supabase `workout_logs`
   → Completed exercises display a green check badge and completed status
   → Workout progress immediately updates in history and dashboard

3. **Monitor and adapt:**
   Open progress dashboard
   → See weekly completion-rate chart and current weight trend
   → See daily and weekly workout streaks
   → At the end of the week, backend evaluates completion rate
   → Backend applies adaptation rules (§5a) to generate next week's plan (±10% targets within 0.5×–1.5× guardrails)
   → User sees updated schedule with adjusted targets and explanatory nudge banners

---

## 8. Success criteria

- [x] I can enter my profile (name, age, height, weight), select an experience level and fitness goal, and receive a 7-day workout schedule.
- [x] I can record the actual sets × reps × weight (or duration × distance) I completed for each exercise, even when it differs from the plan, and see the record after refreshing.
- [x] I can view my workout history, weekly completion-rate trend, and current streak.
- [x] I can access text instructions and a YouTube demonstration video for each scheduled exercise.
- [x] A signed-in user can only access their own data (verified via Supabase RLS — a second user cannot see or modify my records).
- [x] If I enter invalid profile data (e.g. height = 0, weight = -5), the app shows a validation error and does not save.
- [ ] Automated end-of-week target adaptation (+10% for ≥90% completion, -10% for 30–59%) runs via Sunday night backend trigger.
- [ ] 3-consecutive-week miss nudges trigger an in-app goal review prompt.

---

## 9. Decisions made along the way

1. **Google OAuth via Supabase Auth:** Implemented a unified `AuthContext` with an `onAuthStateChange` listener and localStorage session caching. Unauthenticated visitors are automatically served `<Landing />` while authenticated sessions load the `<Navbar />` and protected routes.
2. **Direct Supabase RLS Client with Server-Authoritative Endpoints:** Client reads and writes user-specific records directly to Supabase with strict Row Level Security policies (`auth.uid() = user_id`), minimizing client-server hops. Complex and trusted calculations (streak algorithms, weekly completion summaries) are executed on the Node.js backend using the Supabase admin client.
3. **Immutable Baseline Columns for Guardrails:** Added `initial_target_*` columns to `plan_exercises` at initial plan generation time, enabling self-contained 0.5×–1.5× adaptation checks without re-reading static templates.
4. **Metric-First Design:** Enforced centimeters (`cm`) and kilograms (`kg`) across all profile forms, log inputs, and charts.
5. **Configuration & Secrets Hygiene:** Segregated browser configuration (`VITE_*`) from private server secrets (`docs/CONFIG_AND_SECRETS.md`), purged temporary mock data, and confirmed zero secrets exist in Git history.

---

## 10. Open questions & risks

**Resolved:**
- ~~How should the system determine the initial workout schedule?~~ → Static lookup table keyed on `(fitness_goal, experience_level)` (12 templates) generated into `workout_plans` and `plan_exercises`.
- ~~How should the system decide when/how to adjust?~~ → Weekly completion rate heuristic with ±10% adjustments and 0.5×–1.5× initial guardrails.
- ~~How will we obtain exercise videos?~~ → Curated YouTube demonstration embeds for the 20-exercise seed library.
- ~~What happens when a user misses workouts?~~ → Consecutive miss counter triggers an encouragement banner / goal-review prompt.
- ~~What does an unauthenticated user see?~~ → Dedicated `<Landing />` page explaining the application with one-click Google OAuth sign-in.

**Remaining for v2:**
- Periodization and deload weeks for advanced trainees.
- Manual exercise substitution / swap within an existing plan.
- Unit system toggle (Imperial lbs/inches vs. Metric kg/cm).

