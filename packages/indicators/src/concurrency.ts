import pLimit from 'p-limit';

const DEFAULT_ANALYTICS_FETCH_CONCURRENCY = 6;

/**
 * Maximum number of analytics fetches allowed to run in parallel from a single
 * fan-out. Configurable via the ANALYTICS_FETCH_CONCURRENCY env var; defaults to
 * a conservative 6 so that one dashboard/report cannot saturate the CPU of a
 * small (e.g. 2-vCPU) database instance with unbounded parallel queries.
 */
export const getAnalyticsFetchConcurrency = (): number => {
  const raw = process.env.ANALYTICS_FETCH_CONCURRENCY;
  const parsed = Number(raw);
  if (raw !== undefined && Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_ANALYTICS_FETCH_CONCURRENCY;
};

/**
 * Map over `items` running `mapper` with bounded concurrency. Behaves like
 * `Promise.all(items.map(mapper))` in every observable way: the resolved array
 * preserves input (index) order, all tasks are awaited, and the first rejection
 * propagates without being swallowed. Only the number of `mapper` calls in
 * flight at once is capped.
 *
 * A fresh limiter is created per call (rather than a shared module-level one) so
 * that nested/recursive fan-outs cannot deadlock competing for a single budget.
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const limit = pLimit(getAnalyticsFetchConcurrency());
  return Promise.all(items.map((item, index) => limit(() => mapper(item, index))));
};
