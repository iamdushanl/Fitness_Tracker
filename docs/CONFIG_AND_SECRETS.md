# Configuration, Secrets Handling & Repo Hygiene Standard

This document establishes the official standard for configuration, environment variables, secrets management, and repository hygiene across the **Personal Fitness Tracker** monorepo.

The goal is to make configuration **boring, predictable, and consistent** across Local Development, Vercel (Frontend), and AWS (Backend).

---

## 1. Core Principles

1. **Explicit Scoping & Naming:** Any variable that touches browser code **must** start with `VITE_`. Any variable without `VITE_` is considered private and **must never** be bundled into client code.
2. **Never Commit Secrets:** Real credentials, tokens, service role keys, and private keys **never** enter Git history. All `.env*` files (except `.env.example`) are strictly ignored.
3. **Single Source of Truth:** The root `.env.example` catalogs every variable across the monorepo with an explanatory comment, default/placeholder, and required environment.
4. **Defense in Depth:** We enforce ignore rules at root `.gitignore`, subproject `.gitignore`, and `.dockerignore`.
5. **Least Privilege Runtime:** Secrets in cloud environments are injected at runtime via managed secret stores (AWS Secrets Manager / Vercel Environment Variables) rather than static files.

---

## 2. Naming Conventions & Scoping Matrix

All environment variable names must use `SCREAMING_SNAKE_CASE`.

| Scope | Prefix | Visibility | Where It Runs | Allowed Contents |
|---|---|---|---|---|
| **Frontend Public** | `VITE_` | **Public** (bundled in client JS, visible in browser) | Browser / Vercel / Vite build | Supabase Project URL, Supabase Anon/Publishable Key, Backend API URL |
| **Backend Private** | *No prefix* | **Secret / Private** (accessible only to Node.js server) | Local Node / Docker / AWS App Runner / ECS | Supabase Service Role Key, Database Passwords, Port, Node Env, CORS Origins |

> [!WARNING]
> **Never prefix a secret with `VITE_`!**
> Vite bundles all `VITE_*` environment variables directly into client-side JavaScript assets. Anyone viewing page source or network requests can read them. Never put database credentials, service role keys, or private API secrets in a `VITE_` variable.

---

## 3. Monorepo Variable Catalog

| Variable Name | Required? | Secret? | Target Service | Default / Example | Purpose |
|---|---|---|---|---|---|
| `VITE_SUPABASE_URL` | **Yes** | No (Public) | Frontend (Vercel) | `https://<ref>.supabase.co` | Supabase project API gateway URL for frontend client. |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | No (Public) | Frontend (Vercel) | `eyJ...` or `sb_publishable_...` | Supabase browser-safe key. Subject to Row Level Security (RLS). |
| `VITE_API_URL` | No | No (Public) | Frontend (Vercel) | `http://localhost:8000` | Base URL of the backend API service (local or AWS App Runner domain). |
| `PORT` | No | No (Config) | Backend (AWS) | `8000` | HTTP port on which the Express server listens. |
| `NODE_ENV` | No | No (Config) | Backend (AWS) | `development` | Node runtime environment (`development`, `test`, `production`). |
| `SUPABASE_URL` | **Yes** | No (Config) | Backend (AWS) | `https://<ref>.supabase.co` | Supabase project URL for the server-side admin client. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | **YES (CRITICAL)** | Backend (AWS) | `eyJ...` | Admin key that bypasses RLS for authoritative calculations (streaks, adaptations). |
| `CORS_ORIGIN` | No | No (Config) | Backend (AWS) | `*` (dev) / `https://your-app.vercel.app` (prod) | Allowed origins header for Express CORS middleware. |
| `AI_API_KEY` | Optional | **YES** | Backend (AWS) | `sk-...` | Optional API key for LLM-based workout insights. |

---

## 4. Where Each Secret & Config Lives

### A. Local Development
- **Root `.env`** (optional unified) or service-level files:
  - `backend/.env` (contains `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `PORT`, etc.)
  - `frontend/.env.local` (contains `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- All `.env`, `.env.local`, `.env.*` are in `.gitignore` and **must never be committed**.

### B. Vercel (Frontend Deployment)
- Stored in **Project Settings → Environment Variables**.
- Scopes: **Production**, **Preview**, **Development**.
- Variables to configure:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL` (points to the AWS App Runner backend domain)
- Note: Vercel automatically exposes variables during the Vite build process.

### C. AWS (Backend Deployment — App Runner / ECS)
- **Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `AI_API_KEY`)**:
  - Stored in **AWS Secrets Manager** or **AWS Systems Manager (SSM) Parameter Store** (`SecureString`).
  - Example SSM parameter: `/fitness-tracker/prod/SUPABASE_SERVICE_ROLE_KEY`.
  - App Runner or ECS Task Definition pulls secrets into container environment variables via IAM execution role permissions at task startup.
- **Non-sensitive Config (`PORT`, `NODE_ENV`, `SUPABASE_URL`, `CORS_ORIGIN`)**:
  - Configured directly in the App Runner service configuration or ECS container definition `environment` block.
- **Docker Containers**:
  - The `backend/Dockerfile` runs as non-root user `node` and `.dockerignore` blocks any local `.env` files from ever entering the image layers.

### D. GitHub Actions (CI/CD)
- Stored in **Repository Settings → Secrets and variables → Actions**.
- Examples: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `VERCEL_TOKEN`.
- Workflows reference them via `${{ secrets.AWS_SECRET_ACCESS_KEY }}`. Never hardcode credentials in workflow YAML files.

---

## 5. The 5-Step Rule for Adding a New Variable

Whenever a new configuration setting or credential is introduced, follow this checklist:

```
[1. CLASSIFY] ──> [2. DOCUMENT] ──> [3. VALIDATE] ──> [4. PROVISION] ──> [5. AUDIT]
```

1. **Classify:**
   - Is it consumed by the browser? Prefix with `VITE_` and confirm it does NOT contain sensitive tokens.
   - Is it consumed only by Node/Express? Use standard name (no `VITE_`) and check if it is a secret.
2. **Document:**
   - Add the variable to `.env.example` (and `backend/.env.example` / `frontend/.env.example`) with a comment explaining what it is and an example/dummy value.
3. **Validate & Default:**
   - In code (e.g. `backend/index.js` or `frontend/src/lib/`), provide a clear fallback or descriptive error message if missing.
4. **Provision Across Environments:**
   - Add to local developer `.env` or `.env.local`.
   - Add to Vercel (if frontend) or AWS Secrets Manager / App Runner (if backend).
5. **Repo Hygiene Audit:**
   - Verify file is untracked using `git status`.
   - Run `git check-ignore <file>` to verify ignore rules match.

---

## 6. Secret Rotation Runbook (Emergency Response)

If a secret is ever accidentally committed or suspected to be compromised:

> [!CAUTION]
> **Simply deleting the file or committing a fix is NOT sufficient.** Once a secret is pushed, it exists in git history and must be rotated immediately at the provider.

### Immediate Action Checklist:
1. **Rotate Key at Provider:**
   - **Supabase Service Role Key:** Go to Supabase Project Settings → **API** → Click **Rotate secret key** (generates a new `service_role` JWT).
   - **Supabase Anon Key:** Rotate if anon key was leaked alongside other sensitive configs or if project was targeted.
   - **AWS Credentials:** Immediately deactivate and delete the affected Access Key in AWS IAM console.
2. **Update Active Deployments:**
   - Update the secret in AWS Secrets Manager / Parameter Store and trigger a new deployment of App Runner / ECS.
   - Update Vercel environment variables and redeploy if frontend keys were rotated.
3. **Update Local Developers:**
   - Update your local `.env` and inform team members to update their local files.
4. **Purge Git History (if committed):**
   - Use `git filter-repo` or `BFG Repo-Cleaner` to remove the secret commit from history.
   - Force-push the sanitized branch (`git push --force-with-lease`).

---

## 7. Fast Secrets Sweep Command

To verify your working tree and commits for potential exposed credentials before pushing:

```bash
# Sweep workspace files (excluding markdown docs)
git grep -i -E "key|secret|password|token" -- . ':!*.md'

# Sweep all historical git commits
git log -p --all -S "service_role" --
```
