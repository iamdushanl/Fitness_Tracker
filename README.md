# FitTrack — Personal Fitness Tracker

FitTrack is an adaptive workout tracking web app that generates personalized 7-day training plans tailored to your fitness goals and experience level. As you log workouts, it computes streaks and dynamically adapts future exercise targets using server-side volume heuristics and progression guardrails.

---

## Where Things Live

```
.
├── frontend/                 # React 19 + Vite SPA (deploys to Vercel)
│   ├── src/                  # Components, pages, context, and Supabase client
│   └── .env.example          # Frontend-specific environment template
├── backend/                  # Node.js + Express REST API (ships to AWS)
│   ├── index.js              # Server entry point and API route definitions
│   ├── middleware/           # Supabase JWT token verification
│   ├── utils/                # Server-authoritative streak & summary algorithms
│   ├── tests/                # Native Node.js test suite
│   ├── Dockerfile            # Multi-stage container build for AWS App Runner
│   └── .env.example          # Backend-specific environment template
├── docs/
│   ├── SPEC.md               # Product specification & business requirements
│   ├── ARCH.md               # System architecture & database schema
│   ├── CONFIG_AND_SECRETS.md # Configuration standard, secrets rules & rotation runbook
│   ├── KNOWN-ISSUES.md       # Documented limitations, debt & future roadmap
│   └── supabase_setup.sql    # Database DDL & Row Level Security policies
├── .github/workflows/        # CI/CD pipeline definitions
├── .env.example              # Central monorepo environment template (NEVER commit .env)
└── .gitignore                # Root Git ignore rules (protects all .env* files)
```

---

## Required Environment Variables

All environment variables follow strict scoping: **`VITE_*` variables are public** (bundled into the browser build), while **unprefixed variables are private server secrets** (never exposed to client code).

For full details and secret management instructions, see [`docs/CONFIG_AND_SECRETS.md`](file:///c:/Users/HP/Documents/fitness-tracker-starter/docs/CONFIG_AND_SECRETS.md).

### Frontend Variables (`frontend/.env.local` or Vercel)

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `VITE_SUPABASE_URL` | **Yes** | Supabase project API gateway URL | `https://your-project-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Browser-safe Supabase key (protected by RLS) | `eyJ...` |
| `VITE_API_URL` | No | Base URL of the backend API service | `http://localhost:8000` |

### Backend Variables (`backend/.env` or AWS Secrets Manager)

| Variable | Required | Secret? | Description | Example / Default |
|---|---|---|---|---|
| `PORT` | No | No | Port on which the Express server listens | `8000` |
| `NODE_ENV` | No | No | Runtime environment (`development`, `production`) | `development` |
| `SUPABASE_URL` | **Yes** | No | Supabase project URL for server queries | `https://your-project-ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | **YES** | Admin service role key (bypasses RLS) | `eyJ...` |
| `CORS_ORIGIN` | No | No | Allowed CORS origin (`*` in dev, Vercel domain in prod) | `*` |
| `AI_API_KEY` | Optional | **YES** | Optional LLM API key for workout insights | `sk-...` |

---

## How to Run Locally

### 1. Configure Environment Files

From the repository root, copy the environment templates:

```bash
# Frontend environment
cp frontend/.env.example frontend/.env.local

# Backend environment
cp backend/.env.example backend/.env
```

Fill in your `SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project dashboard.

---

### 2. Run the Front End (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **`http://localhost:5173`**.

---

### 3. Run the Backend API (Node.js + Express)

```bash
cd backend
npm install
npm run dev
```

The API will be available at **`http://localhost:8000`**.  
Check service health at: **`http://localhost:8000/health`**.

---

### 4. Run Backend in a Container (Docker)

To build and run the production container locally (mirroring AWS App Runner):

```bash
cd backend

# Build Docker image
docker build -t fitness-tracker-api .

# Run container with environment variables
docker run -d --name fitness-api -p 8000:8000 --env-file .env fitness-tracker-api

# Verify container health
curl http://localhost:8000/health
```

To stop and remove the container:
```bash
docker stop fitness-api && docker rm fitness-api
```

---

### 5. Run Tests & Validation

```bash
# Run backend test suite (unit + route tests)
cd backend && npm test

# Run frontend production build
cd frontend && npm run build

# Run linting
cd frontend && npm run lint

# Check git secret hygiene
git grep -i -E "key|secret|password|token" -- . ':!*.md'
```

---

## Architecture & Decisions

1. **Monorepo Structure:** Frontend, backend, and documentation reside in a single repository for synchronized versioning and shared specification history.
2. **Server-Authoritative Heuristics:** Streak calculations, volume comparisons, and ±10% weekly adaptation logic are executed on the backend to prevent client manipulation and enforce safe 0.5×–1.5× volume guardrails.
3. **Configuration & Secrets Standard:** Strictly separated public `VITE_*` configuration from private server secrets. Secrets are managed via AWS Secrets Manager / Parameter Store and Vercel, with zero credentials permitted in Git history.
4. **Row Level Security (RLS):** Supabase database tables enforce strict tenant isolation (`auth.uid() = user_id`) for direct client access, while the backend utilizes the `service_role` key solely for authoritative cross-record calculations.
5. **Transparency & Known Limitations:** All architectural trade-offs, roadmap items, and deferred features are tracked openly in [`docs/KNOWN-ISSUES.md`](file:///c:/Users/HP/Documents/fitness-tracker-starter/docs/KNOWN-ISSUES.md).

---

## Author
- **Name:** Dushan Liyanage (`iamdushanl`)
- **Project:** Spec-Driven Cloud Bootcamp — Personal Fitness Tracker
