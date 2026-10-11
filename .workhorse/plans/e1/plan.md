# Cap analytics query concurrency

## Why the first attempt (#6892) was dropped

- It created a fresh `p-limit` per fan-out call (indicators and aggregation groups). The caps multiplied through the arithmetic-indicator recursion, so they never set a real ceiling. Each server's knex pool (default max 10) was already a tighter bound.
- What it did do was run each report's queries one after another. On a cold buffer cache after deploy, the queries are disk-bound and run better in parallel, so reports ran slower and timed out on first load in QA.

## Cold caches: QA vs prod

- Feature deployments (`spin_up_tupaia_deployment`) restore a brand new RDS instance from a snapshot. A restored volume pulls each block from S3 the first time it is read, so first loads are far slower than a normal cold cache. Andrew's first-load timeouts happened in this situation.
- Prod app restarts (redeploy or swap-out of the server) don't touch RDS, so Postgres's cache survives them. Only a reboot of the RDS instance, or a failover, empties it, and even then the data is read from the local volume, not S3.
- A cap only slows things down when the database could have used more parallel reads than the cap allows. To compare branches on a QA deployment, warm the database first (load the dashboards once) so lazy loading doesn't swamp the result.

## Approach

- One process-wide limiter at the leaf: `TupaiaDataApi.fetchAnalytics` and `fetchEvents`. Every heavy analytics SQL query from report-server, data-table-server and web-config-server passes through here.
- Deadlock-free with a single shared budget, because each slot wraps exactly one SQL query that never waits on another slot.
- Only heavy queries are gated, so pool connections stay free for light queries (dashboard list, entities, permissions).
- `ANALYTICS_QUERY_CONCURRENCY` env var. Unset means no cap (no behaviour change), so it can merge safely and be tuned on prod against Performance Insights.
- An invalid value throws on the first analytics query rather than silently running uncapped.

## Steps

- [x] Shared limiter in `packages/data-api/src/limitQueryConcurrency.ts`
- [x] Wrap analytics and events queries in `TupaiaDataApi`
- [x] Unit tests for the limiter
- [x] Document env var in `env/db.env.example`
- [ ] Set `ANALYTICS_QUERY_CONCURRENCY` on prod (start around 4) and watch Performance Insights

## Follow-ups (not this card)

- Frontend viewport-based lazy loading of dashboard items
