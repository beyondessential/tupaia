import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

let sharedPGliteInstance: PGlite | null = null;

export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

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
      // TEMPORARY — REMOVE BEFORE MERGING.
      // Maximum PGlite logging, to diagnose startup failures on low-spec devices. Everything it
      // emits goes through `console`, so it is picked up by the startup log shown on the failure
      // screen. Level 5 logs every protocol message, so it is slow enough to distort any timings
      // taken while it is on.
      debug: 5,
    });
  }

  return {
    pglite: sharedPGliteInstance,
  };
};
