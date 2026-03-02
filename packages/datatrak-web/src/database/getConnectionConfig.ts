import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

let sharedPGliteInstance: PGlite | null = null;

export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  // IMPORTANT: Reuse the same PGlite instance to avoid data isolation issues
  if (!sharedPGliteInstance) {
    sharedPGliteInstance = new PGlite(connectionString);
  } 

  return {
    pglite: sharedPGliteInstance,
  };
};
