import pLimit from 'p-limit';

const DEFAULT_ANALYTICS_FETCH_CONCURRENCY = 6;

/**
 * Per-fan-out concurrency cap for analytics fetches, configurable via the
 * ANALYTICS_FETCH_CONCURRENCY env var (defaults to a conservative 6). See
 * `mapWithConcurrency` for exactly what this does and does not bound.
 *
 * The value is parsed once on first use and cached: env vars are static after
 * process startup, so a dashboard fanning out across many builders would
 * otherwise re-parse the same string on every `mapWithConcurrency` call. Reading
 * lazily (rather than at module load) keeps it robust to test env setup that
 * runs after this module is imported.
 */
let cachedAnalyticsFetchConcurrency: number | undefined;
export const getAnalyticsFetchConcurrency = (): number => {
  if (cachedAnalyticsFetchConcurrency === undefined) {
    const raw = process.env.ANALYTICS_FETCH_CONCURRENCY;
    const parsed = Number(raw);
    cachedAnalyticsFetchConcurrency =
      raw !== undefined && Number.isInteger(parsed) && parsed > 0
        ? parsed
        : DEFAULT_ANALYTICS_FETCH_CONCURRENCY;
  }
  return cachedAnalyticsFetchConcurrency;
};

/**
 * Map over `items` running `mapper` with bounded concurrency. Behaves like
 * `Promise.all(items.map(mapper))` in every observable way: the resolved array
 * preserves input (index) order, all tasks are awaited, and the first rejection
 * propagates without being swallowed. Only the number of `mapper` calls in
 * flight at once is capped.
 *
 * A fresh limiter is created per call (rather than a shared module-level one) so
 * that nested/recursive fan-outs cannot deadlock. The fan-out is recursive:
 * `IndicatorApi.buildAnalyticsForBuilders` fans out over builders, and an
 * arithmetic indicator's builder re-enters `buildAnalyticsForBuilders` for its
 * parameter builders (see `AnalyticArithmeticBuilder.fetchParameterAnalytics`)
 * before reaching the leaf `aggregator.fetchAnalytics` DB call. A single shared
 * limiter across those levels would deadlock: outer builder tasks would hold all
 * the slots while awaiting inner tasks that can never acquire one.
 *
 * NOTE ON THE ACTUAL BOUND: because each call gets its own limiter, this bounds
 * each fan-out level *independently* — it is NOT a flat process-wide (or even
 * per-request) cap on in-flight DB queries. Aggregate concurrency therefore
 * scales with recursion depth and breadth (roughly `limit` per level, so on the
 * order of `limit ^ depth × breadth` in the worst case), where depth is the
 * arithmetic parameter-nesting depth — typically shallow, but unbounded in
 * principle. The cap prevents any single level from fanning out without limit;
 * it does not guarantee a global ceiling of `limit` queries per dashboard. A
 * true global ceiling would require a shared limiter placed *only* around the
 * leaf DB call (`aggregator.fetchAnalytics`), leaving orchestration awaits
 * unlimited so they never hold a DB slot while waiting — left as a follow-up.
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const limit = pLimit(getAnalyticsFetchConcurrency());
  return Promise.all(items.map((item, index) => limit(() => mapper(item, index))));
};
