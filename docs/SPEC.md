# SPEC.md — Personal Fitness Tracker

> **This is your plan, in plain words.** Fill in every section below *before* you ask an AI agent to build anything.
> A good spec answers "what and why"; it does **not** describe code. Keep it short, clear and honest.
> Delete the italic prompts as you replace them with your own answers.

---

## 1. One-line summary
*In a single sentence, what is this app and who is it for?*

> _e.g. "A private web app where I log workouts and see whether I'm hitting my weekly goals."_

## 2. The people (users)
*Who uses this? For a personal tracker it may just be "me", but say it clearly. What do they want to achieve?*

- **Primary user:**
- **What they want:**
- **What would make them stop using it:**

## 3. Core features (v1)
*The smallest set of features that makes this genuinely useful. Aim for 3–6. If you can't demo it, it's not a feature yet.*

1.
2.
3.

## 4. Non-goals (out of scope for v1)
*Just as important as features. What are you deliberately NOT building yet? This protects you from scope creep.*

-
-
-

## 5. The data
*What information does the app store? List the main "things" and their key fields. Don't design tables yet — that's ARCH.md.*

- **Thing:** _e.g. Workout_ — fields: _e.g. date, type, duration, notes_
- **Thing:**
- **Thing:**

## 6. Sign-in
*This app uses Google (Gmail) login via Supabase. Answer:*

- What can a signed-out visitor see (if anything)?
- What is private to the signed-in user?

## 7. Key user journeys
*Walk through 2–3 things a user actually does, start to finish, in plain steps.*

1. **Log a workout:** _e.g. Sign in → tap "Add" → pick type & duration → save → see it in today's list._
2. **Check my week:**
3.

## 8. Success criteria
*How will you KNOW v1 is done and good? Write checks you can tick off.*

- [ ]
- [ ]
- [ ]

## 9. Open questions & risks
*What are you unsure about? What might be hard? Note it here so you (and the AI) don't pretend it's solved.*

-
-

---

### How to use this file with your AI agent
1. Fill in the sections above yourself — the thinking is the point.
2. Ask your agent to **review** the spec for gaps or contradictions *before* writing code.
3. When you build a feature, point the agent at the exact spec section it implements.
4. When the spec changes, update this file first — it is the source of truth, not the code.
