import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  if (process.env.NODE_ENV === 'production') {
    return {
      pglite: new PGlite(connectionString),
    };
  }

  return {
    connectionString,
  };
};
