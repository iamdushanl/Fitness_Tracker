# Personal Fitness Tracker — Starter Repo

Your project home for the **Spec-Driven Cloud Bootcamp**. You'll take this from an
empty scaffold to a deployed app: front end on Vercel, data + Gmail login on Supabase,
and a containerised backend that ships to AWS.

> **Golden rule:** you may let AI write the code, but never ship what you can't explain.

## Where things live
```
.
├── docs/
│   ├── SPEC.md          # WHAT you're building (fill this in first)
│   └── ARCH.md          # HOW it's built (fill this in second)
├── frontend/            # React app -> deploys to Vercel
├── backend/             # API + Dockerfile -> runs locally, then AWS
│   └── Dockerfile
├── .github/workflows/
│   └── ci.yml           # GitOps: build/check/deploy on every push
├── .env.example         # copy to .env and fill in (never commit .env)
└── .gitignore
```

## The order you'll work in
1. **Weeks 1–3 — Set up & spec.** Install Antigravity, then write `docs/SPEC.md` and `docs/ARCH.md`.
2. **Weeks 4–6 — Build with AI.** Front end on Vercel, Gmail login + data on Supabase.
3. **Weeks 7–9 — Backend & containers.** Build the API, Dockerise it, run locally.
4. **Weeks 10–12 — GitOps & cloud.** GitHub Actions pipeline, then deploy the container to AWS.

## First steps
1. Fork/clone this repo and open it in **Antigravity**.
2. Copy `.env.example` to `.env` and keep it secret.
3. Fill in `docs/SPEC.md`. Ask your agent to review it before building.

_Everyone builds the same kind of app; your architecture is your own._
