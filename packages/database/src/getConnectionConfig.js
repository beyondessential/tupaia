/**
 * Tupaia
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

const CI_CONNECTION_CONFIG = {
  host: process.env.CI_TEST_DB_URL,
  user: process.env.CI_TEST_DB_USER,
  password: process.env.CI_TEST_DB_PASSWORD,
  database: process.env.CI_TEST_DB_NAME,
  ssl: null,
};

const SERVER_CONNECTION_CONFIG = {
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_ENABLE_SSL === 'true'
      ? {
          // Test server cannot turn on ssl, so sets the env to disable it
          rejectUnauthorized: false,
        }
      : null,
};

const validateConfig = config => {
  if (config.ssl) {
    return;
  }

  ['DB_URL', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].forEach(requiredField => {
    if (!process.env[requiredField]) {
      throw new Error(
        `Invalid database connection configuration: please specify '${requiredField}' in a .env file`,
      );
    }
  });
};

export const getConnectionConfig = () => {
  const config =
    process.env.CI_NAME === 'codeship' ? CI_CONNECTION_CONFIG : SERVER_CONNECTION_CONFIG;
  validateConfig(config);
  return config;
};
