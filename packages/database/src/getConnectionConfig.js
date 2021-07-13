/**
 * Tupaia
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { requireEnv } from '@tupaia/utils';

const getServerConfig = () => ({
  host: requireEnv('DB_URL'),
  port: requireEnv('DB_PORT'),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
  ssl:
    process.env.DB_ENABLE_SSL === 'true'
      ? {
        // Test server cannot turn on ssl, so sets the env to disable it
        rejectUnauthorized: false,
      }
      : null,
});

const getCiConfig = () => ({
  host: requireEnv('CI_TEST_DB_URL'),
  user: requireEnv('CI_TEST_DB_USER'),
  password: requireEnv('CI_TEST_DB_PASSWORD'),
  database: requireEnv('CI_TEST_DB_NAME'),
  ssl: null,
});

export const getConnectionConfig = () => {
  // Note: Must use functions to guarantee environment variables have loaded
  return process.env.CI_NAME === 'codeship' ? getCiConfig() : getServerConfig();
};
