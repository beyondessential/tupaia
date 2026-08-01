import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

let sharedPGliteInstance: PGlite | null = null;

export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  /**
   * PGlite’s own logging, controlled by `PG_LITE_DEBUG_LEVEL` (1–5, increasingly verbose).
   *
   * Level 1 reports whether it found an existing database and resumed, or found none and ran
   * `initdb`. That distinction is otherwise invisible, and it is the difference between a genuinely
   * first run and a resume onto a data directory left incomplete by an earlier attempt.
   *
   * TODO: default back to '0' before merging. Temporarily defaulted to the most verbose level to
   * diagnose startup failures on low-spec devices, where there is no practical way to set a
   * build-time environment variable. Note that level 5 logs every protocol message, so it is slow
   * in its own right and will skew any timings taken while it is on.
   */
  const debugLevel = Number(getEnvVarOrDefault('PG_LITE_DEBUG_LEVEL', '5'));

  /*
   * Note on `relaxedDurability`: it makes every write to IndexedDB fire-and-forget, which is a
   * large speed-up, but it is unsafe during first-run setup. PGlite creates the database cluster,
   * then persists the whole data directory with `await syncToFs()` — and under relaxed durability
   * that await returns before the write lands. Setup reports success, the app carries on, and if
   * anything closes or reloads the page before the background write finishes, IndexedDB is left
   * holding a partial data directory. PGlite then finds it on the next launch, takes its "found
   * DB, resuming" path instead of running initdb again, and the database comes up missing pieces
   * (which surfaces as errors like `language "plpgsql" does not exist`). That state is permanent
   * until storage is cleared.
   *
   * Note also that with the flag on there is no way to force a durable flush: `syncToFs()` never
   * awaits the real write, so an explicit call at a safe point doesn’t help.
   *
   * If reinstating it, gate it so it is only enabled once a first startup has completed.
   */

  // IMPORTANT: Reuse the same PGlite instance to avoid data isolation issues
  if (!sharedPGliteInstance) {
    sharedPGliteInstance = new PGlite(connectionString, {
      ...(debugLevel > 0 && { debug: debugLevel as 1 | 2 | 3 | 4 | 5 }),
    });
  }

  return {
    pglite: sharedPGliteInstance,
  };
};
