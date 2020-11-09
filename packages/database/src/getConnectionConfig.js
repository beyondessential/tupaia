/**
 * Tupaia
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

const getServerConfig = () => ({
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
});

const getCiConfig = () => ({
  host: process.env.CI_TEST_DB_URL,
  user: process.env.CI_TEST_DB_USER,
  password: process.env.CI_TEST_DB_PASSWORD,
  database: process.env.CI_TEST_DB_NAME,
  ssl: null,
});

const validateEnv = () => {
  ['DB_URL', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].forEach(requiredField => {
    if (!process.env[requiredField]) {
      throw new Error(
        `Invalid database connection configuration: please specify '${requiredField}' in a .env file`,
      );
    }
  });
};

export const getConnectionConfig = () => {
  validateEnv();
  // Note: Must use functions to guarantee environment variables have loaded
  return process.env.CI_NAME === 'codeship' ? getCiConfig() : getServerConfig();
};
