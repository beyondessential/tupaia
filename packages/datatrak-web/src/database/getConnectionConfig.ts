import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

let sharedPGliteInstance: PGlite | null = null;

export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  // IMPORTANT: Reuse the same PGlite instance to avoid data isolation issues
  if (!sharedPGliteInstance) {
    // relaxedDurability: flush to IndexedDB asynchronously after a query returns, rather than
    // blocking every commit on the flush. Writes remain atomic; at worst a crash immediately
    // after a write loses that write, which matches the durability meditrak accepts with Realm.
    sharedPGliteInstance = new PGlite(connectionString, { relaxedDurability: true });
  }

  return {
    pglite: sharedPGliteInstance,
  };
};
