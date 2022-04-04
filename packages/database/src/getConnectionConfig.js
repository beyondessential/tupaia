/**
 * Tupaia
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { requireEnv, getEnvVarOrDefault } from '@tupaia/utils';

const getServerConfig = () => ({
  host: requireEnv('DB_URL'),
  port: getEnvVarOrDefault('DB_PORT', 5432),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: process.env.USE_TEST_DB === 'true' ? requireEnv('TEST_DB_NAME') : requireEnv('DB_NAME'),
  ssl:
    process.env.DB_ENABLE_SSL === 'true'
      ? {
          // Test server cannot turn on ssl, so sets the env to disable it
          rejectUnauthorized: false,
        }
      : null,
});

export const getConnectionConfig = () => {
  // Note: Must use functions to guarantee environment variables have loaded
  return getServerConfig();
};
