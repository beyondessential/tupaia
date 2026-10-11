import pLimit from 'p-limit';

type Limiter = <T>(fn: () => Promise<T>) => Promise<T>;

const runImmediately: Limiter = fn => fn();

let limiter: Limiter | undefined;

/**
 * Caps how many analytics and events queries this process runs against the database at once,
 * via the ANALYTICS_QUERY_CONCURRENCY env var. Unset means no cap.
 *
 * @privateRemarks One limiter is shared by the whole process, so the cap holds however many
 * reports, indicators and aggregation groups fan out above it. This is deadlock-free because each
 * slot wraps a single SQL query, which never waits on another slot. Created lazily so env vars
 * loaded after import still apply.
 */
const getLimiter = (): Limiter => {
  if (!limiter) {
    const raw = process.env.ANALYTICS_QUERY_CONCURRENCY;
    const concurrency = Number(raw);
    if (!raw) {
      limiter = runImmediately;
    } else if (Number.isInteger(concurrency) && concurrency > 0) {
      limiter = pLimit(concurrency);
    } else {
      throw new Error(`ANALYTICS_QUERY_CONCURRENCY must be a positive integer, got "${raw}"`);
    }
  }
  return limiter;
};

export const limitQueryConcurrency = <T>(fn: () => Promise<T>): Promise<T> => getLimiter()(fn);
