import { PGlite } from '@electric-sql/pglite';

import { getEnvVarOrDefault } from '@tupaia/utils';

export const getConnectionConfig = async () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  if (process.env.NODE_ENV === 'production') {
    const response = await fetch('pglite.data');
    const fsBundle = await response.blob();
    const text = await fsBundle.text();

    console.log('fsBundle', fsBundle);
    console.log('texttt', text);
    return {
      pglite: new PGlite(connectionString, {
        fsBundle
      }),
    };
  }

  return {
    connectionString,
  };
};
