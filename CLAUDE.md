# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Install dependencies
```sh
yarn
```

### Build
```sh
# Build all packages
yarn build

# Build a specific package (and its internal dependencies)
yarn workspace @tupaia/<package-name> build

# Build only non-legacy packages (actively maintained)
yarn build:nonlegacy

# Watch for changes in a specific package
yarn workspace @tupaia/<package-name> build-watch
```

### Run dev servers
```sh
# Start a full stack (options: admin-panel, datatrak, lesmis, psss, tupaia-web)
yarn start-stack tupaia-web

# Start a specific server in dev mode
yarn workspace @tupaia/tupaia-web-server start-dev

# Start with internal dependency watching
yarn workspace @tupaia/central-server start-dev -i
```

### Tests
```sh
# Test a specific package
yarn workspace @tupaia/<package-name> test

# Test with coverage
yarn workspace @tupaia/<package-name> test:coverage

# Run all tests
yarn test-all
```

### Lint
```sh
yarn workspace @tupaia/<package-name> lint
yarn workspace @tupaia/<package-name> lint:fix
```

### Database
```sh
# Run migrations
yarn migrate

# Create a new migration
yarn migrate-create <migration-name>

# Roll back one migration
yarn migrate-down

# Set up test database (required before running tests in packages that need db)
yarn workspace @tupaia/<package-name> setup-test
```

### Types generation

**Always run this after any database schema change** (adding/removing columns, creating/dropping tables, or modifying migrations):
```sh
yarn workspace @tupaia/types generate
```

Skipping this will cause TypeScript type errors and stale model types throughout the codebase.

## Architecture

Tupaia is a **yarn workspaces monorepo** with 30+ packages in three categories:

### Package categories

**Platform interfaces** – React (Vite) web apps:
- `tupaia-web` – Main data visualisation platform (tupaia.org)
- `datatrak-web` – Offline-first data collection app
- `admin-panel` – Administrative interface

**Orchestration servers** – Express backends dedicated to each frontend (use `@tupaia/server-boilerplate`):
- `tupaia-web-server`, `datatrak-web-server`, `admin-panel-server`
- `web-config-server` – Legacy orchestration server, still has some active functionality

**Micro servers** – Shared system services:
- `central-server` – Primary CRUD/auth server; talks directly to PostgreSQL
- `entity-server` – Entity and hierarchy management
- `report-server` – Report building and data transformation
- `data-table-server` – Data table operations

**Libraries** – Used across the system:
- `database` – PostgreSQL models, migrations (db-migrate + knex). Models live in `src/modelClasses/`
- `server-boilerplate` – Base `Route` class, orchestration/micro-server scaffolding, shared model TypeScript types
- `types` – Auto-generated TypeScript types from DB schema + hand-written request/response types
- `data-broker` – Gateway to external data sources (DHIS2, KoBoToolbox, Superset, weather, etc.)
- `data-api` – Analytics table and data fetching
- `ui-components`, `ui-chart-components`, `ui-map-components` – Shared React component libraries
- `utils`, `tsutils` – Common utilities
- `access-policy`, `auth` – Authentication and authorisation

### Key patterns

**Route pattern** – All server endpoints extend `Route` from `@tupaia/server-boilerplate` and implement `buildResponse()`. The base class handles error propagation to Express middleware.

**Orchestration vs micro servers** – Orchestration servers (e.g. `tupaia-web-server`) handle auth sessions and call micro servers (via `ctx.services`) rather than accessing the database directly. The micro servers (e.g. `central-server`) own direct DB access and enforce permissions.

**TypeScript types** – Request/response types are defined in `packages/types/src/types/requests/` and generated models in `packages/types/src/types/models.ts` (from the DB schema). Run `yarn workspace @tupaia/types generate` after schema changes.

**Database models** – `packages/database/src/modelClasses/` contains JS classes extending `DatabaseModel`/`DatabaseRecord`. TypeScript wrappers for orchestration servers are in `packages/server-boilerplate/src/models/`.

**Testing** – Most TS packages use Jest. `central-server` uses Mocha + Chai. Packages that need DB access require a test database (`yarn workspace @tupaia/<package-name> setup-test` before the first run).

**Mix of JS and TS** – Older packages (e.g. `central-server`, `database`) are JavaScript with Babel. Newer packages (e.g. `tupaia-web-server`, `server-boilerplate`) are TypeScript. Prefer TypeScript for new packages.

**UI library** – Material UI v4 is common, but the project is migrating toward MUI v7. `styled-components` is used for styling.

**State management** – Frontends use `@tanstack/react-query` v4. Redux exists in some apps and is being phased out.

## Git workflow

- Branch from `dev` (not `master`). Feature branches merge to `dev`; `dev` merges to `master` fortnightly as a release.
- PR titles must follow **Conventional Commit** format and are enforced by CI:
  ```
  type(scope): description
  feat(scope): TEAM-123: description   # feat PRs require a Linear ticket number
  ```
  Allowed types: `ci`, `db`, `deps`, `doc`, `env`, `feat`, `fix`, `fmt`, `merge`, `refactor`, `repo`, `revert`, `style`, `test`, `tweak`

## ESLint

All ESLint config lives in the root `.eslintrc`. Do not add per-package ESLint config files — update the root config instead.
