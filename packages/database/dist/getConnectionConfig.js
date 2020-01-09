'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Tupaia
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

// Note: Must use function to guarantee environment variables have loaded.
var getConnectionConfig = exports.getConnectionConfig = function getConnectionConfig() {
  return process.env.CI_NAME === 'codeship' ? {
    host: process.env.CI_TEST_DB_URL,
    user: process.env.CI_TEST_DB_USER,
    password: process.env.CI_TEST_DB_PASSWORD,
    database: process.env.CI_TEST_DB_NAME,
    ssl: null
  } : {
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_DISABLE_SSL === 'true' ? null : {
      // Test server cannot turn on ssl, so sets the env to disable it
      rejectUnauthorized: false
    }
  };
};