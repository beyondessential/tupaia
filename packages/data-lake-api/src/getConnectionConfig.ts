import { requireEnv, getEnvVarOrDefault } from '@tupaia/utils';

export const getConnectionConfig = () => ({
  host: requireEnv('DATA_LAKE_DB_URL'),
  port: getEnvVarOrDefault('DATA_LAKE_DB_PORT', 5432),
  user: requireEnv('DATA_LAKE_DB_USER'),
  password: requireEnv('DATA_LAKE_DB_PASSWORD'),
  database: requireEnv('DATA_LAKE_DB_NAME'),
  ssl:
    process.env.DB_ENABLE_SSL === 'true'
      ? {
          // Test server cannot turn on ssl, so sets the env to disable it
          rejectUnauthorized: false,
        }
      : null,
});
