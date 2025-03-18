import { getEnvVarOrDefault } from '@tupaia/utils';

const getServerConfig = () => ({
  connectionString: getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://my-pgdata'),
});

export const getConnectionConfig = () => {
  // Note: Must use functions to guarantee environment variables have loaded
  return getServerConfig();
};
