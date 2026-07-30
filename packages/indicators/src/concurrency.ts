import pLimit from 'p-limit';

const DEFAULT_ANALYTICS_FETCH_CONCURRENCY = 6;

// Per-fan-out concurrency cap for analytics fetches, from the ANALYTICS_FETCH_CONCURRENCY env var
// (default 6). Parsed once and cached; read lazily so test env setup after import still applies.
let cachedAnalyticsFetchConcurrency: number | undefined;
const getAnalyticsFetchConcurrency = (): number => {
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
 * Bounded-concurrency `Promise.all`: preserves index order, awaits all tasks, and propagates the
 * first rejection — only the count of in-flight `mapper` calls is capped.
 *
 * One limiter per call — bounds each fan-out level independently; a single shared limiter would
 * deadlock the recursive builder fan-out (outer builders would hold every slot while awaiting inner
 * builders that can never acquire one). This is therefore NOT a global/per-request cap: aggregate
 * concurrency still scales with recursion depth. See the PR discussion for the full analysis.
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const limit = pLimit(getAnalyticsFetchConcurrency());
  return Promise.all(items.map((item, index) => limit(() => mapper(item, index))));
};
