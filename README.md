# Long-run

**Long-run** is a competitive running-tracker mobile app inspired by Strava.
Users sign up, record a run with live GPS tracking, and see their route,
distance, duration, and pace — with real-time leaderboards to compete against
other runners. It's built as a full-stack portfolio project to demonstrate
mobile development combined with geospatial data and real-time systems.

## What it does

- **Sign up / sign in** with a Firebase-backed account.
- **Record a run**: the app tracks GPS position live while you run, showing
  elapsed time and distance as you go.
- **Save the run**: when you finish, the full route is uploaded and stored
  server-side. Distance is computed from the actual GPS track using
  PostGIS spatial functions (not an approximation on the phone).
- **View run history**: past runs with date, distance, duration, and pace.
- **Compete on leaderboards**: daily, weekly, and all-time rankings by total
  distance, updated the moment a run is saved and served from Redis Sorted
  Sets rather than a SQL `ORDER BY`.
- **Get notified** *(planned)*: push notifications for achievements and
  challenges via Firebase Cloud Messaging.

## Tech stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Location | expo-location (foreground GPS tracking) |
| Backend | Node.js (NestJS) |
| Database | PostgreSQL + PostGIS (geospatial storage & queries) |
| Real-time leaderboards | Redis Sorted Sets |
| Auth | Firebase Authentication |
| Notifications | Firebase Cloud Messaging |
| DevOps | pnpm workspaces, Docker, GitHub Actions |

## Project structure

A pnpm monorepo:

```
apps/
├── mobile/    # Expo React Native app
└── api/       # NestJS backend
    └── src/modules/
        ├── auth/           # Firebase token verification
        ├── users/          # User profiles (CRUD)
        ├── activities/     # GPS run tracking (PostGIS)
        ├── leaderboard/    # Redis-backed rankings
        └── notifications/  # Push notifications (planned)
packages/
└── shared/    # Types shared between mobile and api
```

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture, conventions, and
the role-based subagent setup used to develop this project.

## Getting started

```bash
pnpm install                  # install all workspaces
cp .env.example .env          # fill in Firebase credentials
docker compose up -d          # start Postgres+PostGIS, Redis, and the api
pnpm --filter mobile start    # run the Expo dev server
```

`docker compose up` builds and runs the whole backend stack — Postgres+PostGIS,
Redis, and the NestJS api itself (from `apps/api/Dockerfile`) — on
`http://localhost:3000`. For faster iteration on the api alone, run just the
databases in Docker and the api on the host instead:

```bash
docker compose up -d postgres redis
pnpm --filter api start:dev   # watch mode, hot reload
```

A real Firebase project (Authentication enabled, with a web app config for
mobile and a service account for the backend) is required for sign-in/sign-up
to work — the app is written against that contract but the credentials in
`.env.example` are placeholders.

## Deployment

Every push to `main` that passes CI builds the api's Docker image and pushes
it to GitHub Container Registry as `ghcr.io/<owner>/<repo>/api` (tagged
`latest` and the commit SHA) — see `.github/workflows/ci.yml`. There is no
hosting target wired up yet; the image is ready to run anywhere that can pull
it and provide `DATABASE_URL`, `REDIS_URL`, and the `FIREBASE_*` env vars
(Fly.io, Railway, Render, or a plain VM all work — pair it with a managed
Postgres+PostGIS instance and a managed Redis instance rather than the
docker-compose ones, which are for local development only).

## Status

| Feature | Status |
|---|---|
| Auth (Firebase sign-up/sign-in) | ✅ Done |
| User profiles (CRUD) | ✅ Done |
| GPS activity tracking (record, store, view history) | ✅ Done |
| Dockerized api + CI image publish | ✅ Done |
| Real-time leaderboards (Redis) | ✅ Done |
| Push notifications (FCM) | ⬜ Planned |
| Production hosting (deploy the built image somewhere) | ⬜ Planned |
| Automated tests | ⬜ Planned |

In active development.
