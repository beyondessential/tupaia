# Cap analytics query concurrency

## Why the first attempt (#6892) was dropped

- It created a fresh `p-limit` per fan-out call (indicators and aggregation groups). The caps multiplied through the arithmetic-indicator recursion, so they never set a real ceiling. Each server's knex pool (default max 10) was already a tighter bound.
- What it did do was run each report's queries one after another. On a cold buffer cache after deploy, the queries are disk-bound and run better in parallel, so reports ran slower and timed out on first load in QA.

## Cold caches: QA vs prod

- Feature deployments (`spin_up_tupaia_deployment`) restore a brand new RDS instance from a snapshot. A restored volume pulls each block from S3 the first time it is read, so first loads are far slower than a normal cold cache. Andrew's first-load timeouts happened in this situation.
- Prod app restarts (redeploy or swap-out of the server) don't touch RDS, so Postgres's cache survives them. Only a reboot of the RDS instance, or a failover, empties it, and even then the data is read from the local volume, not S3.
- A cap only slows things down when the database could have used more parallel reads than the cap allows. To compare branches on a QA deployment, warm the database first (load the dashboards once) so lazy loading doesn't swamp the result.

## Process count on prod

- `startBackEnds.sh` ran report-server and web-config-server in pm2 cluster mode with one instance per app-server core minus one (7 each on prod's 8 vCPUs). data-table-server runs as one instance.
- The limiter is per process, so the real ceiling on heavy queries is the cap × (report-server instances + web-config-server instances + 1). For example, on an 8-core app server that's 15 processes, so a cap of 4 still allows 60 heavy queries against a 2-vCPU database.
- Each process also has its own knex pools of up to 10 connections. That likely explains the ~114 average active sessions on prod.
- Decision: run a fixed 2 copies each of report-server and web-config-server. That's 5 processes in total, so a cap of 3 gives a predictable ceiling of 15 heavy queries. More copies don't help much when the database has only 2 vCPUs.
- Risk: report transforms run in Node, so 2 copies give less CPU for that work. Watch for heavy dashboards getting slower on the app side, not just the database side.

## Approach

- One process-wide limiter at the leaf: `TupaiaDataApi.fetchAnalytics` and `fetchEvents`. Every query against the `analytics` materialized view on the main Tupaia database passes through here, whichever server issues it. The other SQL paths run against different databases, so they don't load the RDS instance this card is about: `SqlDataTableService` queries external database connections, and `DataLakeApi` queries the data lake.
- Deadlock-free with a single shared budget, because each slot wraps exactly one SQL query that never waits on another slot.
- Only heavy queries are gated, so pool connections stay free for light queries (dashboard list, entities, permissions).
- `ANALYTICS_QUERY_CONCURRENCY` env var. Unset means no cap (no behaviour change), so it can merge safely and be tuned on prod against Performance Insights.
- An invalid value throws on the first analytics query rather than silently running uncapped.

## Steps

- [x] Shared limiter in `packages/data-api/src/limitQueryConcurrency.ts`
- [x] Wrap analytics and events queries in `TupaiaDataApi`
- [x] Unit tests for the limiter
- [x] Document env var in `env/db.env.example`
- [x] Run 2 copies each of report-server and web-config-server in `startBackEnds.sh`
- [ ] Set `ANALYTICS_QUERY_CONCURRENCY` on prod (start at 3) and watch Performance Insights

## Follow-ups (not this card)

- Frontend viewport-based lazy loading of dashboard items
