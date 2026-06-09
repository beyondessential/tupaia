# Agent: Tupaia Conventions

Check for Tupaia-specific conventions, domain rules, project antipatterns, and readability/naming standards.

Read `CLAUDE.md` for the full architecture overview and conventions. Key things to check:

## Route pattern

All server endpoints must extend `Route` from `@tupaia/server-boilerplate` and implement `buildResponse()`. The base class handles error propagation — do not catch and swallow errors that should bubble up.

## Orchestration vs micro-server boundaries

Orchestration servers (`tupaia-web-server`, `datatrak-web-server`, `admin-panel-server`) must not access the database directly. They communicate with micro-servers via `ctx.services`. Flag any orchestration server code that imports from `@tupaia/database` or instantiates database models directly.

## TypeScript types

`packages/types/src/types/models.ts` is auto-generated — never edit manually. If a PR modifies migrations or the DB schema, check that `yarn workspace @tupaia/types generate` was run.

Request/response types for new endpoints should be defined in `packages/types/src/types/requests/`.

## Database models

JS models in `packages/database/src/modelClasses/` extend `DatabaseModel`/`DatabaseRecord`. TypeScript wrappers for orchestration servers live in `packages/server-boilerplate/src/models/`.

## JS/TS mixed codebase

Older packages (`central-server`, `database`) are JavaScript. New code should be TypeScript. Flag new `.js` files in packages that are already TypeScript, or `require()` calls in TypeScript files.

## State management

Frontends use `@tanstack/react-query` v4. New code should not introduce Redux — it is being phased out.

## Styling

`styled-components` is preferred. The project is migrating from MUI v4 to MUI v7 — flag new v4-specific MUI API usage (e.g. `makeStyles`, `createStyles`) in packages that have already migrated.

## Testing conventions

`central-server` uses Mocha + Chai. All other TS packages use Jest. Don't mix test frameworks within a package.

Ignore: high-level architecture, performance, generic security, generic bugs.
