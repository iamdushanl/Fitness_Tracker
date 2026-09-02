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

_This app uses Google (Gmail) login via Supabase. Answer:_

- What can a signed-out visitor see (if anything)?
  1.  View the public landing page.
  2.  Understand what the application does.
  3.  Sign in using Google.

- What is private to the signed-in user?
  1. All personalized data and workout schedules.
  2. Workout history and progress.

## 7. Key user journeys

1. **Create my workout plan:**
   Sign in
   → Enter name, age, height (cm), weight (kg)
   → Select experience level (beginner / intermediate / advanced)
   → Select fitness goal (weight loss / muscle gain / general fitness / endurance)
   → Submit
   → System looks up the matching template from the 12-template lookup table
   → Display a 7-day workout schedule with prescribed exercises and targets
   → User can browse each exercise's instructions and YouTube demo video

2. **Complete and record a workout:**
   Open today's workout
   → See the list of prescribed exercises with targets
   → Tap an exercise
   → View instructions + YouTube demo
   → Perform the exercise
   → Enter actual results: sets × reps × weight (strength) **or** duration × distance (cardio)
   → Save → Exercise is marked complete
   → After all exercises, the workout is saved with a timestamp
   → Workout appears in history

3. **Monitor and adapt:**
   Open progress dashboard
   → See weekly completion-rate chart and current weight
   → See current streak
   → At the end of the week, system evaluates completion rate
   → System applies adaptation rules (§5a) to generate next week's plan
   → User sees updated schedule with adjusted targets
   → If targets changed, a brief explanation is shown (e.g. "Targets increased 10% — great week!")

## 8. Success criteria

- [ ] I can enter my profile (name, age, height, weight), select an experience level and fitness goal, and receive a 7-day workout schedule.
- [ ] I can record the actual sets × reps × weight (or duration × distance) I completed for each exercise, even when it differs from the plan, and see the record after refreshing.
- [ ] I can view my workout history, weekly completion-rate trend, and current streak.
- [ ] If I complete ≥ 90% of my prescribed exercises in a week, next week's targets are visibly higher.
- [ ] If I complete < 30% or log nothing, the app shows an encouragement message and prompts me to review my goal.
- [ ] I can access text instructions and a YouTube demonstration video for each scheduled exercise.
- [ ] A signed-in user can only access their own data (verified via Supabase RLS — a second user cannot see or modify my records).
- [ ] If I enter invalid profile data (e.g. height = 0, weight = -5), the app shows a validation error and does not save.

## 9. Open questions & risks

**Resolved in this spec:**

- ~~How should the system determine the initial workout schedule?~~ → Static lookup table keyed on (fitness_goal, experience_level) — see 5a.
- ~~How should the system decide when/how to adjust?~~ → Weekly completion-rate heuristic with ±10% adjustments and guardrails — see 5a.
- ~~How will we obtain exercise videos?~~ → Curated YouTube links for a seed library of ~20 exercises — see 5.
- ~~What happens when a user misses workouts?~~ → 3-consecutive-week miss triggers a goal-review prompt — see 5a.

**Remaining open questions:**

- How will we ensure workout templates are safe for all body types and ages? (v1 approach: add a health disclaimer; v2: consult a fitness professional to review templates.)
- Should we allow users to manually edit or skip individual exercises in a generated plan, or must they follow it as-is?
- Should the progress dashboard show an estimated goal-completion date, or just trend data?

### How to use this file with your AI agent

1. Fill in the sections above yourself — the thinking is the point.
2. Ask your agent to **review** the spec for gaps or contradictions _before_ writing code.
3. When you build a feature, point the agent at the exact spec section it implements.
4. When the spec changes, update this file first — it is the source of truth, not the code.
