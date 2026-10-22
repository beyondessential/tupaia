# Test cases: cap analytics query concurrency

## Automated

- [x] Env var unset: all queries run at once
- [x] Env var set: in-flight queries across separate callers never exceed the cap
- [x] A failed query frees its slot
- [x] Invalid values (0, negative, decimal, non-numeric) are rejected

## Deployment

- [ ] `pm2 ls` on a deployment shows 2 copies each of report-server and web-config-server

## Manual (env var unset)

- [ ] Dashboards and map overlays load the same as on dev, including the first load after deploy

## Manual (env var set, e.g. `ANALYTICS_QUERY_CONCURRENCY=3` on report-server, data-table-server, web-config-server)

- [ ] FluTracking default dashboard loads fully on first visit after deploy, with no timeouts beyond what dev shows
- [ ] Dashboard values match dev for a sample of items, including arithmetic indicators
- [ ] Large dashboard PDF export completes
- [ ] Admin panel stays responsive while several heavy dashboards load
- [ ] Several users loading heavy dashboards at once see no clear slowdown versus dev (2 copies give less Node CPU for report transforms)
