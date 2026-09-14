# CLAUDE.md

Guidance for Claude Code (and human contributors) working in this repository.

## 1. What this project is

**Long-run** is a competitive fitness-tracking app (Strava-inspired) focused on
GPS running activities and real-time leaderboards. It is a portfolio project that
demonstrates full-stack mobile development with geospatial and real-time data.

### Core features
- GPS-based activity tracking (running)
- Real-time competitive leaderboards
- Personal stats and performance history
- Push notifications for achievements and challenges

### Tech stack
| Layer | Technology |
|---|---|
| Mobile | React Native + Expo |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Backend | Node.js (NestJS) |
| Database | PostgreSQL + PostGIS (geospatial queries) |
| Real-time leaderboard | Redis Sorted Sets |
| Auth | Firebase Authentication |
| Notifications | Firebase Cloud Messaging |
| DevOps | Docker, GitHub Actions |

## 2. Repository layout (monorepo)

Managed as a **pnpm workspace**. Three workspaces under `apps/*` and `packages/*`.

```
Long-run/
├── apps/
│   ├── mobile/           # Expo React Native app (NativeWind for styling)
│   │   └── src/
│   │       ├── screens/      # Screen-level components (one per route)
│   │       ├── components/    # Reusable presentational components
│   │       ├── navigation/    # React Navigation stacks/tabs
│   │       ├── hooks/         # Custom React hooks
│   │       ├── services/      # API client, GPS, storage wrappers
│   │       ├── store/         # Client state (e.g. Zustand/Redux)
│   │       ├── types/         # Mobile-only types
│   │       └── utils/         # Pure helpers (formatting, geo math)
│   └── api/              # NestJS backend
│       └── src/
│           ├── modules/
│           │   ├── auth/          # Firebase token verification, guards
│           │   ├── users/         # Profiles, stats
│           │   ├── activities/    # GPS activity ingest + PostGIS storage
│           │   ├── leaderboard/   # Redis Sorted Set ranking
│           │   └── notifications/ # FCM push
│           ├── common/        # Shared filters, interceptors, decorators
│           └── config/        # Env/config module
├── packages/
│   └── shared/           # Types + constants shared between mobile and api
├── .claude/agents/       # Subagent role definitions (see section 4)
├── docker-compose.yml    # Local Postgres+PostGIS and Redis
└── .github/workflows/    # CI
```

## 3. Development

> Status: auth + GPS activity tracking + leaderboards + Dockerized backend.
> Sign-up/sign-in (Firebase Authentication), the `users` module (TypeORM +
> PostgreSQL, full CRUD), and the backend guard that verifies Firebase ID
> tokens are implemented. The `activities` module stores GPS runs: the
> mobile app records a route with `expo-location`, uploads it, and the
> backend stores the track as a PostGIS `geography` LineString and computes
> distance with `ST_Length` (never reimplemented in application code). The
> `leaderboard` module ranks runners by total distance per window (daily,
> weekly, all-time) using Redis Sorted Sets (`ZINCRBY` on every saved
> activity, `ZREVRANGE`/`ZREVRANK` to read) — never a SQL `ORDER BY` on the
> hot path. The api is containerized (`apps/api/Dockerfile`, multi-stage
> pnpm-workspace build) and `docker compose up` runs the full backend stack
> (Postgres+PostGIS, Redis, api); CI publishes the image to GHCR on every
> push to `main`. There is no hosting target wired up yet — that's a deploy
> step for whoever runs this, not something built in. The app will not fully
> run until a real Firebase project's credentials are filled into `.env` —
> the code is written against that contract already.
>
> Packaging note: `packages/shared`'s `package.json` `main`/`types` point at
> its own compiled `dist/`, not raw `.ts` source — required so
> `require("@long-run/shared")` resolves to real JS when the api runs as
> plain compiled output (e.g. in the Docker image), not just under
> `nest start`'s dev-time path aliasing. Build `packages/shared` before
> building `apps/api` whenever it changes.

```bash
pnpm install                 # install all workspaces
pnpm --filter mobile start   # run Expo dev server
pnpm --filter api start:dev  # run NestJS in watch mode
docker compose up -d         # start Postgres+PostGIS + Redis locally
```

Copy `.env.example` to `.env` and fill in values before running the backend.

### Conventions
- **Language:** TypeScript everywhere.
- **Shared types** live in `packages/shared` — never duplicate a DTO/type across
  `apps/mobile` and `apps/api`; put it in `shared` and import it.
- **Styling (mobile):** use NativeWind `className`. Do not introduce a second
  styling system (no styled-components, no raw `StyleSheet` unless NativeWind
  genuinely cannot express it).
- **Geospatial:** all distance/route math and storage go through PostGIS. Do not
  reimplement geo math in application code when a PostGIS function exists.
- **Leaderboards:** rankings are served from Redis Sorted Sets, not computed
  with SQL `ORDER BY` on hot paths.
- **Commits:** clear, descriptive messages. Do not create a PR unless asked.

## 4. Subagents (roles)

Role-specific subagents are defined in `.claude/agents/`. Each has a defined
scope, an assigned model, an approximate token budget per task, and explicit
"do not touch" boundaries. Delegate work to the matching role rather than doing
everything in the main thread.

| Agent | Model | ~Tokens/task | Owns | Must NOT touch |
|---|---|---|---|---|
| `uxui-designer` | Sonnet | 30–60k | Design system, component specs, screen flows, NativeWind tokens | Backend, DB, business logic |
| `frontend-mobile` | Sonnet | 40–80k | `apps/mobile` implementation, navigation, API client wiring | `apps/api`, DB, infra |
| `backend-api` | Sonnet | 40–80k | `apps/api` modules, controllers, services, DTOs | `apps/mobile` UI, raw SQL migrations (defer to db agent), infra secrets |
| `database-geospatial` | Opus | 30–60k | PostGIS schema/migrations, geo queries, Redis leaderboard design | UI, unrelated backend endpoints |
| `devops` | Haiku | 15–30k | Docker, `docker-compose`, GitHub Actions, env templates | Application/business logic, product code |
| `qa-reviewer` | Opus | 30–60k | Tests, code review, security review | Writing feature code (reviews/tests only, no product features) |

Model rationale: **Opus** for work needing deep reasoning (geospatial/query
design, review); **Sonnet** for standard implementation; **Haiku** for
config/boilerplate. Token figures are planning estimates per delegated task, not
hard caps.

### Boundary rules (enforced)
- An agent edits only files inside its scope. Cross-cutting changes (e.g. a new
  shared type used by both mobile and api) go through `packages/shared` and are
  coordinated in the main thread.
- `qa-reviewer` never authors feature code — it only reviews and writes tests.
- `devops` never edits application/business logic.
- Any change to `packages/shared` is a shared contract change: flag it so
  dependent agents can update their side.

## 5. Guardrails
- Do not write feature/UI code during the scaffolding phase unless explicitly
  asked — keep changes to structure and config.
- Never commit secrets. Use `.env` (gitignored); keep `.env.example` in sync.
- Do not add a dependency without a clear need; prefer what the stack already
  implies.
