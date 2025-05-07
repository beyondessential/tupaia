import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

export const getConnectionConfig = () => ({
  pglite: new PGlite(getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db')),
});
