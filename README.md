# BuoyBuddy

A dashboard for NOAA buoy conditions. A Kotlin/Spring Boot backend proxies NOAA's
[National Data Buoy Center](https://www.ndbc.noaa.gov/) realtime feed behind JWT auth; a
React/Vite frontend shows current conditions, historical trends, and direction charts for a
station, plus a side-by-side comparison of several stations.

## Architecture

| | |
|---|---|
| **Backend** | Kotlin + Spring Boot (Gradle), port `9000`. JWT-authenticated REST API, Postgres via JPA/Hibernate. |
| **Frontend** | React 19 + TypeScript + Vite, port `5173`. |
| **Database** | Postgres 16 (`docker-compose.yaml` maps container port 5432 → host port `5433`). |

## Prerequisites

- **JDK 17** — the Gradle build pins `jvmToolchain(17)` exactly; a newer JDK won't satisfy it
  unless you let Gradle auto-provision one.
- **Node 20.19+ or 22.12+** — required by Vite 8 (`vite@8`/`rolldown`). An older Node can still
  mostly work but may hit a missing native-binding error on `npm install` (see Troubleshooting).
- **Postgres 16**, reachable at the URL you put in `.env` — via Docker (`docker-compose.yaml` is
  provided) or a local install.

## Setup

### 1. Database

With Docker:

```sh
cd backend
docker compose up -d
```

This starts Postgres on `localhost:5433` with the `buoybuddy` database, using
`DB_USERNAME`/`DB_PASSWORD` from `backend/.env` (see below). Without Docker, point `DB_URL` at
any Postgres 16 instance you control instead — the app creates the `buoybuddy` database's schema
itself on first boot (`spring.jpa.hibernate.ddl-auto=update`).

### 2. Backend

```sh
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_URL=jdbc:postgresql://localhost:5433/buoybuddy
JWT_SECRET=<any long random string>
```

Then run it:

```sh
./gradlew bootRun      # macOS/Linux
gradlew.bat bootRun     # Windows
```

The API comes up on `http://localhost:9000`.

### 3. Frontend

```sh
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, register an account, and log in.

## API overview

| Endpoint | Auth | Description |
|---|---|---|
| `POST /register` | — | Create an account, returns a JWT |
| `POST /login` | — | Authenticate, returns a JWT |
| `GET /api/ndbc/{stationId}.txt` | Bearer JWT | Raw NDBC realtime2 text for a station |
| `GET /api/ndbc/{stationId}/parsed` | Bearer JWT | Same data, parsed to JSON (columns/units/history) |
| `GET /api/buoy-readings/{userId}` | Bearer JWT | Stored per-user buoy readings (currently unused by the frontend — no write path exists yet) |

Station IDs are NOAA NDBC station numbers, e.g. `46239` (Monterey Bay, CA). Find others at the
[NDBC station map](https://www.ndbc.noaa.gov/obs.shtml).

## Troubleshooting

- **Gradle can't find a JDK 17** (`Cannot find a Java installation... matching {languageVersion=17}`):
  install a JDK 17 (e.g. [Temurin](https://adoptium.net/temurin/releases/?version=17)) and either
  set `JAVA_HOME` to it before running Gradle, or add a toolchain resolver
  (`org.gradle.toolchains.foojay-resolver-convention` in `settings.gradle`) so Gradle can
  auto-download one.
- **No admin rights / no Docker**: both JDK and Postgres are available as no-install zip/binary
  distributions — Temurin ships a portable JDK zip, and postgresql.org / EnterpriseDB ship
  Postgres as binaries you can `initdb`/`pg_ctl` directly from a user-writable directory, no
  service registration required.
- **`npm run dev` fails with `Cannot find native binding` / `@rolldown/binding-...`**: this is a
  known npm optional-dependency bug that shows up on some Node versions. Upgrading Node to the
  version Vite requires is the real fix; as a workaround you can install the missing platform
  package directly, e.g. `npm install @rolldown/binding-win32-x64-msvc` on Windows x64.
