import { requireEnv, getEnvVarOrDefault } from '@tupaia/utils';

const getServerConfig = ({ userEnv = 'DB_USER', passEnv = 'DB_PASSWORD' }) => ({
  host: requireEnv('DB_URL'),
  port: getEnvVarOrDefault('DB_PORT', 5432),
  user: requireEnv(userEnv),
  password: requireEnv(passEnv),
  database: requireEnv('DB_NAME'),
  ssl:
    process.env.DB_ENABLE_SSL === 'true'
      ? {
          // Test server cannot turn on ssl, so sets the env to disable it
          rejectUnauthorized: false,
        }
      : null,
});

export const getConnectionConfig = (user = {}) => {
  // Note: Must use functions to guarantee environment variables have loaded
  return getServerConfig(user);
};
