# AutomataTodo — Full-stack CI/CD Example

This repository is a full-stack example app (a TODO app) built as a Turborepo monorepo. It demonstrates:

- a Next.js 14 (App Router) frontend with NextAuth (GitHub OAuth)
- a Fastify + Drizzle ORM backend (Postgres)
- local development using Docker (Postgres)
- database migrations with drizzle-kit
- unit and integration tests with Vitest and Playwright (E2E)
- CI/CD with GitHub Actions and semantic-release + Terraform-based IaC for AWS

This README documents how the repo is organized, how to run it locally, how authentication and task ownership (client_id) work, how to run migrations and tests, and troubleshooting tips.

Table of contents
- Project layout
- Tech stack
- Getting started (prerequisites + quick start)
- Environment variables
- Database & migrations
- Running the apps (dev & production)
- Authentication and client_id flow
- API overview
- Tests (unit / e2e)
- CI / CD & infra notes
- Troubleshooting

## Project layout

Top-level folders you'll use most:

- `apps/web` — Next.js web application (App Router). Contains the UI, NextAuth route, client-side code and tests.
- `apps/api` — Fastify API with domain-driven structure (entities, repositories, use-cases, controllers). Uses Drizzle ORM for Postgres.
- `config` — shared config packages (eslint, prettier, TypeScript presets used across the monorepo).
- `iac` — Terraform code for provisioning AWS resources (ECR, App Runner, RDS, IAM, etc.).

Important files:

- `apps/web/src/app/api/auth/[...nextauth]/route.ts` — NextAuth route and exported `authOptions` used by server components.
- `apps/api/drizzle` — generated migration SQL files (drizzle-kit output).
- `apps/api/src/http/database/migrate.ts` — a small script that runs drizzle migrations against `DB_URL`.

## Tech stack

- Monorepo: pnpm + Turborepo
- Frontend: Next.js (App Router), React, shadcn/ui components
- Auth: NextAuth.js (GitHub OAuth provider)
- Backend: Fastify, Drizzle ORM (Postgres), TypeScript
- Database: PostgreSQL (Bitnami image in docker-compose for local dev)
- Testing: Vitest (unit), Playwright (E2E)
- Migrations: drizzle-kit
- IaC: Terraform

## Getting started — prerequisites

Make sure you have the following installed locally:

- Node.js >= 18
- pnpm (workspace manager used by this repo)
- Docker and Docker Compose (for local Postgres)

Clone and install:

```bash
git clone <this-repo>
cd automata-todo
pnpm install
```

## Environment variables

Copy environment examples into each app and edit values:

- API: `apps/api/.env` (example file present in repo). Important variables:
  - `DB_URL` — Postgres connection string used by the API (e.g. postgresql://docker:docker@localhost:5432/automata-todo)
  - `DB_TEST_URL` — test database connection (optional)
  - `API_PORT` — default 4000
  - `JWT_SECRET` — used by API auth utilities if enabled

- Web: `apps/web/.env.local` (copy from `.env.local` example).
  - `API_URL` — URL of the API (default http://localhost:4000)
  - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — GitHub OAuth app credentials
  - `NEXTAUTH_SECRET` — random string used by NextAuth (set this)
  - `NEXTAUTH_URL` — e.g. http://localhost:3000

Security note: The repo may contain placeholder values; replace them with your own secrets before deploying.

## Database & migrations

This project uses PostgreSQL and Drizzle for schema + migrations.

Start the local database with Docker Compose:

```bash
docker compose up -d db
```

Run migrations (generate SQL from schema and apply to DB):

```bash
# from the repo root
cd apps/api
pnpm db:generate   # generates a migration file in apps/api/drizzle
pnpm db:migrate    # runs the migrate.ts script that applies migrations to DB
```

`db:generate` uses `drizzle-kit generate` (configured in `apps/api/drizzle.config.ts`). `db:migrate` runs the small `migrate.ts` helper which connects to `DB_URL` and applies SQL.

Direct push (drizzle-kit push) is also available if preferred:

```bash
cd apps/api
pnpm db:push
```

Inspect the database:

```bash
docker exec -it automata-todo-db psql -U docker -d automata-todo
-- inside psql shell:
\dt                 -- list tables
SELECT COUNT(*) FROM "Tasks";
SELECT * FROM "Tasks" LIMIT 50;
TRUNCATE TABLE "Tasks";  -- remove all tasks if needed
\q
```

## Running the apps locally

Start both apps with Turborepo (recommended):

```bash
pnpm dev
```

This runs the web (Next.js) and API simultaneously. By default:

- Web: http://localhost:3000
- API: http://localhost:4000

Screenshot — main overview

![Main overview — /tasks page](main_overview.png)

If you prefer to run a single package:

```bash
# run only the API
pnpm --filter @automata-todo/api dev

# run only the web
pnpm --filter @automata-todo/web dev
```

### Build & production

Build everything:

```bash
pnpm build
```

Run production builds per package (see `apps/*/package.json`) or containerize with the included Dockerfiles.

## Authentication and client_id (task ownership)

Authentication uses NextAuth with GitHub as the OAuth provider. Important notes:

- The NextAuth route is at `/api/auth/[...nextauth]` inside `apps/web`.
- On first login the `jwt` callback stores the provider account id (GitHub id) on the token as `client_id`.
- The `session` callback copies `token.client_id` into `session.user.client_id`.
- The UI and server actions use `client_id` to associate tasks with the OAuth account — the API expects `client_id` when creating and fetching tasks.

Flow for creating tasks:

1. Client calls `/tasks` (POST) with `{ title, client_id }` (frontend gets `client_id` from `session.user.client_id`).
2. Backend stores the task with the `client_id` column in the `Tasks` table.

If you want immediate redirection after sign-in, the SignIn button passes `callbackUrl: '/tasks'` to NextAuth. If you need account choice on repeated sign-in, the UI signs out the current session before calling `signIn()` so GitHub prompts account selection.

## API overview

The API follows a REST-ish structure. Main endpoints (Fastify controllers under `apps/api/src/http/controllers`):

- GET  /tasks?status=ALL|PENDING|COMPLETED&client_id=<id> — fetch tasks for a client
- POST /tasks — create a task (body: `{ title, client_id }`)
- DELETE /tasks/:id — delete a task
- PATCH  /tasks/:id/toggle — toggle completed state

Responses are JSON and the controllers validate shapes with Zod.

## Tests

Run all tests (monorepo):

```bash
pnpm test
```

Run tests for a single package:

```bash
cd apps/web
pnpm test

cd ../api
pnpm test
```

Unit tests use Vitest. Frontend component tests that use `useSession()` are wrapped in `SessionProvider` in tests (see `apps/web/src/components/*.test.tsx`) so they run in the test environment.

## CI / CD & Infrastructure

- This repo includes GitHub Actions workflows that run tests, lint, build and publish. It uses `semantic-release` for automated versioning.
- Terraform code in `/iac` provisions AWS resources (ECR, RDS, App Runner, IAM, etc.). Review and provide your AWS credentials and backend before applying.

## Common troubleshooting

- Postgres connection refused: ensure Docker container is running (`docker compose ps`) and `DB_URL` points to the correct host/port. If Docker is on a remote host or WSL, update `DB_URL` accordingly.
- Migrations failing with SQL syntax errors: inspect generated SQL in `apps/api/drizzle/*.sql` and the target Postgres version.
- NextAuth type error from `.next` generated types: remove `.next` and restart dev to regenerate typed route artifacts:

```powershell
Remove-Item -Recurse -Force .next
pnpm dev
```

- Tests failing because `useSession()` throws: wrap components with `SessionProvider` in tests or use the shared test-wrapper.

## Developer tips and notes

- The repo follows a domain-driven layout in the API: `domain/entities`, `domain/use-cases`, `http/controllers`, and `http/repositories` (Drizzle implementations).
- The `client_id` is the GitHub provider account id; it's stored on the token via `jwt` callback and copied to the session to make it available on the frontend.
- Use the `apps/api/src/http/database/migrate.ts` script to run migrations programmatically (it uses Drizzle's migrator).

## Quick commands summary

```bash
# install
pnpm install

# start DB
docker compose up -d db

# generate migrations (api) and apply
cd apps/api
pnpm db:generate
pnpm db:migrate

# start dev (both apps)
pnpm dev

# run tests
pnpm test

# clean Next.js generated types (if you hit weird type errors)
Remove-Item -Recurse -Force .next
pnpm dev
```
Created for demonstration. Inspired by rcmonteiro