import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  if (process.env.NODE_ENV === 'production') {
    // preallocate 128MB of memory for the pglite instance, otherwise it can cause out of memory issue when syncing a lot of changes while the browser is running a lot of tabs
    return {
      pglite: new PGlite(connectionString, { initialMemory: 128 * 1024 * 1024 }),
    };
  }

  return {
    connectionString,
  };
};
