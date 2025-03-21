import { getEnvVarOrDefault } from '@tupaia/utils';

export const getConnectionConfig = () => ({
  connectionString: getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db'),
});
