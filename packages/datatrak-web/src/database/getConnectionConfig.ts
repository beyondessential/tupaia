import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

// Track how many times getConnectionConfig is called
let connectionConfigCallCount = 0;
let sharedPGliteInstance: PGlite | null = null;

export const getConnectionConfig = () => {
  connectionConfigCallCount++;
  console.log('[getConnectionConfig] Called', {
    callCount: connectionConfigCallCount,
    hasSharedInstance: !!sharedPGliteInstance,
    nodeEnv: process.env.NODE_ENV,
  });

  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  // IMPORTANT: Reuse the same PGlite instance to avoid data isolation issues
  if (!sharedPGliteInstance) {
    console.log('[getConnectionConfig] Creating new PGlite instance');
    sharedPGliteInstance = new PGlite(connectionString);
  } else {
    console.log('[getConnectionConfig] Reusing existing PGlite instance');
  }

  return {
    pglite: sharedPGliteInstance,
  };

  return {
    connectionString,
  };
};
