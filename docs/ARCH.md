# ARCH.md — Architecture

> **This is how your app is built** — the decisions behind the code.
> You write this *after* `SPEC.md` and *before* serious building. It's yours to design; there is no single right answer.
> Keep it current: if the build drifts from this doc, fix the doc.

---

## 1. Big picture
*Describe, in 3–4 sentences, how the parts fit together. What talks to what?*

> _e.g. "The React front end (on Vercel) talks to Supabase directly for auth and simple data. A separate backend API (in a container) handles calculated things like streaks, and also reads from Supabase."_

## 2. Architecture diagram
*Draw it. A simple boxes-and-arrows sketch is fine. You can paste an image, or use a text diagram like the one below.*

```
[ Browser ]
     |
     v
[ Front end: React ] ----> [ Supabase: Auth + Postgres ]
   (Vercel)                        ^
     |                             |
     v                             |
[ Backend API: <your choice> ] ----+
   (Docker -> AWS)
```

## 3. Components
*List each part, what it's responsible for, and where it runs.*

| Component | Responsibility | Tech | Runs on |
|-----------|----------------|------|---------|
| Front end | UI, user actions | React | Vercel |
| Auth | Google/Gmail login | Supabase Auth | Supabase cloud |
| Database | Store workouts, goals | Supabase Postgres | Supabase cloud |
| Backend API | Logic the UI shouldn't own | _your choice (FastAPI / Node / …)_ | Docker → AWS |

## 4. Data model
*Turn SPEC section 5 into tables. List each table, its columns, types, and how tables relate. Note which user owns each row.*

**Table: `workouts`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| user_id | uuid | owner (from auth) |
| ... | | |

**Table: `...`**

*Relationships:*
> _e.g. "one user has many workouts"_

## 5. Access rules (security)
*Who can read/write what? With Supabase you'll use Row-Level Security. State the rule in words first.*

- _e.g. "A user can only read and write rows where `user_id` = their own id."_

## 6. API contract
*If you have a backend, list its endpoints: method, path, what it needs, what it returns. Keep it small.*

| Method | Path | Input | Returns |
|--------|------|-------|---------|
| GET | `/health` | – | `{ "status": "ok" }` |
| GET | `/summary/week` | user (from token) | weekly totals & streak |
| ... | | | |

## 7. Secrets & configuration
*What secrets exist (API keys, DB URLs)? Where do they live? (Never in git.)*

- Front end env vars: _e.g. Supabase URL + anon key_
- Backend env vars: _e.g. Supabase service key, port_
- Where stored: `.env` locally (git-ignored); platform settings in Vercel / AWS.

## 8. Deployment plan
*Match the course pipeline. Fill in your specifics.*

| Piece | Local (early) | Cloud (final) |
|-------|---------------|---------------|
| Front end | dev server | Vercel |
| Data & auth | Supabase cloud | Supabase cloud |
| Backend | Docker on my laptop | Docker on AWS (ECR + _App Runner / ECS / EC2_) |

## 9. Decisions & trade-offs
*Note any real choice you made and why — and one alternative you rejected. This is what you'll defend in your demo.*

- **Decision:** _e.g. "Streaks are computed in the backend, not the browser."_
  **Why:** …
  **Rejected alternative:** …

---

### How to use this file with your AI agent
1. Design the sections above yourself; the agent can suggest, but you decide.
2. Ask the agent to build **one component at a time**, pointing it at the relevant section.
3. After each build, check the code matches this doc. If reality won, update the doc.
