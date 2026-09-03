# ARCH.md — Architecture

> **This is how your app is built** — the decisions behind the code.
> You write this _after_ `SPEC.md` and _before_ serious building. It's yours to design; there is no single right answer.
> Keep it current: if the build drifts from this doc, fix the doc.

---

## 1. Big picture

The React front end, hosted on Vercel, provides the user interface and handles user interactions. Supabase provides Google authentication and the PostgreSQL database for storing user profiles, workout plans, workout records, exercises, and progress data. The Node.js + Express backend API handles trusted fitness logic such as generating personalized workout plans and adapting future workouts based on the user's actual performance. The backend runs in Docker during development and will be deployed to AWS, while the frontend communicates with both Supabase and the backend API as needed.

## 2. Architecture diagram

![Architecture Diagram](./Fitness_tracker.drawio.png)

## 3. Components

| Component   | Responsibility                                                                                                               | Tech              | Runs on        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------- |
| Front end   | Public landing page, user interface, displaying workout plans, recording performance, showing progress and exercise guidance | React             | Vercel         |
| Auth        | Google/Gmail sign-in and user authentication                                                                                 | Supabase Auth     | Supabase cloud |
| Database    | Store user profiles, workout plans, workout records, exercises and progress data                                             | Supabase Postgres | Supabase cloud |
| Backend API | Generate workout plans, evaluate actual performance, adapt future workouts and provide trusted fitness logic                 | Node.js + Express | Docker → AWS   |

## 4. Data model

The application uses six PostgreSQL tables. The 12 initial workout templates are static backend configuration, organized by fitness goal and experience level; they are not stored as user database tables. When a user creates a plan, the backend uses the matching template to generate the user's `workout_plan` and `plan_exercises` records.

### Table: `users`

| Column             | Type        | Notes                                                           |
| ------------------ | ----------- | --------------------------------------------------------------- |
| `id`               | uuid        | Primary key; linked to Supabase Auth user                       |
| `name`             | text        | User's name                                                     |
| `age`              | int         | User's age                                                      |
| `height_cm`        | numeric     | Height in centimeters                                           |
| `weight_kg`        | numeric     | Current weight in kilograms                                     |
| `experience_level` | text        | `beginner`, `intermediate`, or `advanced`                       |
| `fitness_goal`     | text        | `weight_loss`, `muscle_gain`, `general_fitness`, or `endurance` |
| `created_at`       | timestamptz | Profile creation time                                           |
| `updated_at`       | timestamptz | Last profile update                                             |

**Ownership:** The authenticated user owns their own profile row.

### Table: `weight_history`

| Column        | Type        | Notes                           |
| ------------- | ----------- | ------------------------------- |
| `id`          | uuid        | Primary key                     |
| `user_id`     | uuid        | Foreign key → `users.id`; owner |
| `weight_kg`   | numeric     | Recorded weight in kilograms    |
| `recorded_at` | timestamptz | When the weight was recorded    |

**Ownership:** Each weight record belongs to the authenticated user. The user's current weight in `users.weight_kg` is also updated to the latest entry.

### Table: `workout_plans`

| Column            | Type        | Notes                                        |
| ----------------- | ----------- | -------------------------------------------- |
| `id`              | uuid        | Primary key                                  |
| `user_id`         | uuid        | Foreign key → `users.id`; owner              |
| `week_start_date` | date        | First day of the planned week                |
| `week_end_date`   | date        | Last day of the planned week                 |
| `template_goal`   | text        | Goal used to select the template             |
| `template_level`  | text        | Experience level used to select the template |
| `created_at`      | timestamptz | Plan creation time                           |

**Ownership:** Each plan belongs to one authenticated user.

### Table: `exercises`

| Column         | Type | Notes                                      |
| -------------- | ---- | ------------------------------------------ |
| `id`           | uuid | Primary key                                |
| `name`         | text | Exercise name                              |
| `category`     | text | `strength`, `cardio`, or `flexibility`     |
| `muscle_group` | text | Primary muscle group or relevant body area |
| `instructions` | text | Manually written exercise instructions     |
| `youtube_url`  | text | Curated public YouTube demonstration URL   |

**Ownership:** Exercise records are shared seed-library data, not owned by individual users.

### Table: `plan_exercises`

| Column                        | Type    | Notes                                                           |
| ----------------------------- | ------- | --------------------------------------------------------------- |
| `id`                          | uuid    | Primary key                                                     |
| `workout_plan_id`             | uuid    | Foreign key → `workout_plans.id`                                |
| `exercise_id`                 | uuid    | Foreign key → `exercises.id`                                    |
| `scheduled_date`              | date    | Date the exercise is scheduled                                  |
| `exercise_order`              | int     | Display/order within the workout                                |
| `target_sets`                 | int     | Current prescribed sets (may be adapted week over week)         |
| `target_reps`                 | int     | Current prescribed reps (may be adapted week over week)         |
| `target_weight_kg`            | numeric | Current prescribed weight (may be adapted week over week)       |
| `target_duration_min`         | numeric | Current prescribed duration (may be adapted week over week)     |
| `target_distance_km`          | numeric | Current prescribed distance (may be adapted week over week)     |
| `initial_target_sets`         | int     | Original sets from the first generated plan (guardrail ref)     |
| `initial_target_reps`         | int     | Original reps from the first generated plan (guardrail ref)     |
| `initial_target_weight_kg`    | numeric | Original weight from the first generated plan (guardrail ref)   |
| `initial_target_duration_min` | numeric | Original duration from the first generated plan (guardrail ref) |
| `initial_target_distance_km`  | numeric | Original distance from the first generated plan (guardrail ref) |

**Ownership:** A plan exercise belongs to the user through its `workout_plan_id`.

### Table: `workout_logs`

| Column                | Type        | Notes                             |
| --------------------- | ----------- | --------------------------------- |
| `id`                  | uuid        | Primary key                       |
| `user_id`             | uuid        | Foreign key → `users.id`; owner   |
| `plan_exercise_id`    | uuid        | Foreign key → `plan_exercises.id` |
| `performed_at`        | timestamptz | When the exercise was performed   |
| `actual_sets`         | int         | Actual completed sets             |
| `actual_reps`         | int         | Actual completed repetitions      |
| `actual_weight_kg`    | numeric     | Actual weight used                |
| `actual_duration_min` | numeric     | Actual cardio duration            |
| `actual_distance_km`  | numeric     | Actual cardio distance            |
| `notes`               | text        | Optional user notes               |

**Ownership:** Each workout log belongs to the authenticated user.

### Relationships

- One user has one current workout plan in V1.
- One user has many `weight_history` entries (one per weigh-in).
- One workout plan contains many `plan_exercises`.
- One exercise can appear in many workout plans through `plan_exercises`.
- Therefore, `workout_plans` and `exercises` have a many-to-many relationship through `plan_exercises`.
- One `plan_exercise` can have multiple `workout_logs` if the user records multiple performance entries.
- Each workout log belongs to one user and references the planned exercise it records.
- The 12 initial workout templates are static backend configuration and generate the database records for each user's plans.

### Computed values (not stored)

- **Weekly completion rate** — calculated from `workout_logs` actual values vs. `plan_exercises` target values for a given week's plan.
- **Streak** — consecutive weeks (ending at the current week) where the user has ≥ 1 `workout_log` entry. Computed at query time by the `GET /progress/summary` endpoint.
- **Weight trend** — derived from `weight_history` entries ordered by `recorded_at`. The starting weight is the earliest entry.

### Data flow

```text
Static 12 Templates
        |
        | matching fitness_goal + experience_level
        v
   Workout Plan
        |
        v
   Plan Exercises
        |
        | user performs exercise
        v
   Workout Logs
        |
        v
Progress calculations
        |
        v
Next week's adapted Workout Plan
```

## 5. Access rules (security)

- **User profile:** A signed-in user can read and update only their own `users` row.
- **Weight history:** A signed-in user can create and read only their own `weight_history` entries.
- **Workout plans:** A signed-in user can read only workout plans where `user_id` matches their authenticated user ID. Users cannot read or modify another user's plans.
- **Plan exercises:** A signed-in user can read only plan exercises belonging to their own workout plan. Users cannot access plan exercises belonging to another user.
- **Exercise library:** Exercise records are shared read-only seed data. Signed-in users can read exercise information but cannot modify the exercise library.
- **Workout logs:** A signed-in user can create, read, update, and delete only their own workout logs.
- **Backend operations:** The backend authenticates requests using the user's Supabase authentication token and performs workout-generation and adaptation logic for the authenticated user.
- **Signed-out visitors:** Signed-out users can view the public landing page but cannot access profiles, workout plans, plan exercises, workout logs, weight history, or progress data.

Supabase Row-Level Security (RLS) will enforce these ownership rules when the database is implemented.

## 6. API contract

The backend API is responsible for trusted workout-planning, adaptation, and progress logic. The authenticated user's identity comes from the Supabase authentication token rather than from a user ID supplied by the client.

| Method | Path                | Input                                                         | Returns                                                                      |
| ------ | ------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/health`           | –                                                             | `{ "status": "ok" }`                                                         |
| POST   | `/plans/generate`   | User profile and fitness goal from authenticated user         | Generated weekly workout plan with plan exercises                            |
| POST   | `/plans/adapt`      | Authenticated user (current week's logs are read server-side) | Adapted next week's plan; `nudge` and `message` fields (see below)           |
| GET    | `/progress/summary` | User from authentication token                                | Weekly completion-rate history, weight trend (from `weight_history`), streak |

### Adaptation logic (`POST /plans/adapt`)

The endpoint calculates the authenticated user's weekly completion rate (percentage of prescribed volume completed) and applies the following heuristic (SPEC §5a):

| Completion Rate            | Action                              |
| -------------------------- | ----------------------------------- |
| ≥ 90%                      | Increase next week's targets by 10% |
| 60–89%                     | Keep targets the same               |
| 30–59%                     | Decrease next week's targets by 10% |
| < 30% or 0 logged workouts | Keep current targets                |

**Guardrails:**

- Targets never exceed **1.5×** the initial plan values (stored in `plan_exercises.initial_target_*` columns).
- Targets never fall below **0.5×** the initial plan values.
- If the user has had < 30% completion for **3 consecutive weeks**, the response includes a prompt to review their goal or profile.

**Response fields:**

- `workout_plan` — the generated plan for the next week.
- `plan_exercises` — the list of exercises with adapted targets.
- `nudge` — `null`, `"encouragement"` (completion < 30%), or `"review_goal"` (3 consecutive weeks below 30%).
- `message` — human-readable explanation when targets change (e.g. "Targets increased 10% — great week!") or `null`.

### Scheduled adaptation trigger

Adaptation runs automatically every **Sunday at 23:00 UTC** via a backend cron job (`node-cron` or equivalent scheduler). The cron iterates over all users with an active workout plan and invokes the same adaptation logic as the manual endpoint. Users can also trigger adaptation on demand via `POST /plans/adapt`.

### Input validation

Profile data submitted during onboarding is validated on both the frontend (immediate user feedback) and the backend (authoritative check):

- `name` — non-empty string
- `age` — positive integer
- `height_cm` — positive number (> 0)
- `weight_kg` — positive number (> 0)
- `experience_level` — one of `beginner`, `intermediate`, `advanced`
- `fitness_goal` — one of `weight_loss`, `muscle_gain`, `general_fitness`, `endurance`

Invalid input returns HTTP `400` with field-level error messages. Database `CHECK` constraints provide a final safety net.

## 7. Secrets & configuration

- **Front end environment variables:**
  - Supabase project URL
  - Supabase anonymous/publishable client key
  - Backend API URL

- **Backend environment variables:**
  - Supabase project URL
  - Supabase server-side secret/service key
  - Backend port

- **Local development:** Store environment variables in `.env` files that are excluded from Git using `.gitignore`.

- **Cloud deployment:** Store environment variables using Vercel environment settings for the frontend and AWS runtime/platform settings for the backend.

- **Security rule:** Secrets and private keys must never be committed to Git or included in frontend source code.

## 8. Deployment plan

| Piece       | Local (early)               | Cloud (final)                               |
| ----------- | --------------------------- | ------------------------------------------- |
| Front end   | React development server    | Vercel                                      |
| Data & auth | Supabase cloud              | Supabase cloud                              |
| Backend     | Node.js + Express in Docker | Docker image in Amazon ECR → AWS App Runner |

The frontend is developed and tested locally before being deployed to Vercel. Supabase provides the cloud database and authentication throughout development and production. The backend is containerized with Docker locally, pushed to Amazon ECR, and deployed as a containerized service on AWS App Runner. The backend includes a `node-cron` scheduled job for Sunday-night automatic workout adaptation (see §6).

## 9. Decisions & trade-offs

- **Decision:** Workout-plan generation, performance evaluation, and workout adaptation logic are handled by the Node.js + Express backend rather than the React frontend.

  **Why:** These rules determine the user's future workout targets and should be handled in a controlled, trusted environment. Keeping the logic in the backend also makes the adaptation rules easier to test, change, and keep consistent across clients.

  **Rejected alternative:** Implementing the adaptation rules entirely in React.

  **Why rejected:** Browser-side logic can be inspected or modified by the client, and putting important business rules in the frontend would make the system harder to control and maintain.

- **Decision:** The 12 initial workout templates are stored as static backend configuration rather than database tables.

  **Why:** V1 uses a fixed set of pre-authored templates based on four fitness goals and three experience levels. Storing them as application configuration avoids unnecessary database complexity.

  **Rejected alternative:** Creating database tables for workout templates.

  **Why rejected:** V1 does not require users to create or manage templates. The database only needs to store the workout plans generated for individual users.

- **Decision:** Initial target values are stored on each `plan_exercises` row (`initial_target_*` columns) rather than re-read from the static template at adaptation time.

  **Why:** Storing the reference values alongside the adapted values makes the 1.5×/0.5× guardrail check a simple same-row comparison. It also decouples adaptation from the template configuration — if templates are revised in a future version, existing users' guardrails remain based on their original plan.

  **Rejected alternative:** Re-reading the static template to determine initial values during each adaptation.

  **Why rejected:** Tightly couples the adaptation logic to the template config. If templates are ever changed, the guardrail reference values for existing users would silently shift.

- **Decision:** Weight history is stored in a separate `weight_history` table rather than keeping only the current value on the `users` row.

  **Why:** The spec requires showing "current weight vs. starting weight" and a weight trend. A history table naturally supports trend visualization and preserves the starting weight without an extra column.

  **Rejected alternative:** Adding a `starting_weight_kg` column to the `users` table.

  **Why rejected:** A single starting-weight column cannot support a weight-trend chart, which the progress dashboard is expected to show.

## 10. Frontend Screens & Component Structure

### Screens

The V1 frontend will contain five main screens:

#### Dashboard

Shows a **snapshot of the current state**: today's scheduled workout, this week's completion rate, current weight, and workout streak. Provides quick navigation to the Workout and Progress screens. This screen answers "what should I do today?" and "how is this week going?"

Week 4 uses mock data.

#### Create Plan

Collects the user's name, age, height, weight, experience level, and fitness goal via a profile form. In Week 4 this screen uses mock data only. In later weeks, the information will be stored through the application's authentication and database layer.

#### Workout

Displays the user's scheduled workout for the selected day. Shows prescribed exercises and their targets. Allows the user to begin recording workout performance by entering actual sets, reps, weight, duration, or distance.

Week 4 uses mock data.

#### Exercise Details

Displays exercise category, muscle group, text instructions, and an embedded YouTube demonstration video. Uses the exercise seed library defined in the specification.

Week 4 uses mock exercise data.

#### Progress

Displays **historical trends and charts**: weekly completion-rate history over time, weight trend from `weight_history`, and cumulative workout streak. This screen answers "how am I doing over weeks and months?" Unlike Dashboard (current snapshot), Progress focuses on longitudinal data.

Week 4 uses mock data.

### Navigation

React Router will be used for client-side navigation.

| Route           | Screen           |
| --------------- | ---------------- |
| `/`             | Dashboard        |
| `/create-plan`  | Create Plan      |
| `/workout`      | Workout          |
| `/exercise/:id` | Exercise Details |
| `/progress`     | Progress         |

> **Note — Landing page:** A public landing page with sign-in will be added in a future iteration. When implemented, `/` will serve the landing page for unauthenticated users and redirect to the Dashboard for authenticated users.

### Route Protection

All routes listed above are protected and require authentication. Unauthenticated users will be redirected to the sign-in flow. Route guards are implemented using a React Router wrapper component (`<ProtectedRoute>`) that checks the user's Supabase authentication state before rendering the target screen.

### Component Structure

```
components/
├── Navbar              # Global navigation bar
├── ProtectedRoute      # Auth guard wrapper for React Router
├── WorkoutCard         # Workout summary card (Dashboard, Workout)
├── ExerciseCard        # Exercise overview card (Workout, Exercise Details)
├── WorkoutLogForm      # Input form for recording actual sets/reps/weight/duration/distance
├── ProfileForm         # Onboarding form for user profile and goal selection
├── YouTubeEmbed        # Responsive YouTube video embed
├── DaySelector         # Day picker for navigating the weekly schedule
├── NudgeBanner         # Adaptation nudge / encouragement message banner
├── ProgressSummary     # Snapshot of completion rate + streak (Dashboard)
├── CompletionChart     # Weekly completion-rate trend chart (Progress)
├── WeightChart         # Weight trend line chart (Progress)
├── StreakCard          # Current streak display
├── WeeklyCompletion    # This week's completion rate display
└── WeightCard          # Current weight display

pages/
├── Dashboard
├── CreatePlan
├── Workout
├── ExerciseDetails
└── Progress

data/
└── mock/
    ├── users.js         # Mock user profile
    ├── exercises.js     # Mock exercise seed library
    ├── plans.js         # Mock workout plans and plan exercises
    ├── logs.js          # Mock workout logs
    └── weightHistory.js # Mock weight history entries
```

The `pages/` directory contains complete application screens, while reusable UI elements are placed in `components/`. Temporary Week 4 mock data is organized as separate modules under `data/mock/` to mirror the data model and keep individual files manageable.

### Component-to-Screen Mapping

| Component          | Dashboard | Create Plan | Workout | Exercise Details | Progress |
| ------------------ | :-------: | :---------: | :-----: | :--------------: | :------: |
| `Navbar`           |     ✓     |      ✓      |    ✓    |        ✓         |    ✓     |
| `ProtectedRoute`   |     ✓     |      ✓      |    ✓    |        ✓         |    ✓     |
| `WorkoutCard`      |     ✓     |             |    ✓    |                  |          |
| `ExerciseCard`     |           |             |    ✓    |        ✓         |          |
| `WorkoutLogForm`   |           |             |    ✓    |                  |          |
| `ProfileForm`      |           |      ✓      |         |                  |          |
| `YouTubeEmbed`     |           |             |         |        ✓         |          |
| `DaySelector`      |           |             |    ✓    |                  |          |
| `NudgeBanner`      |     ✓     |             |         |                  |          |
| `ProgressSummary`  |     ✓     |             |         |                  |          |
| `CompletionChart`  |           |             |         |                  |    ✓     |
| `WeightChart`      |           |             |         |                  |    ✓     |
| `StreakCard`       |     ✓     |             |         |                  |    ✓     |
| `WeeklyCompletion` |     ✓     |             |         |                  |    ✓     |
| `WeightCard`       |     ✓     |             |         |                  |    ✓     |

### How to use this file with your AI agent

1. Design the sections above yourself; the agent can suggest, but you decide.
2. Ask the agent to build **one component at a time**, pointing it at the relevant section.
3. After each build, check the code matches this doc. If reality won, update the doc.
