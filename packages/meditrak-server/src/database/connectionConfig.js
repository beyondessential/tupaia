/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

// Note: Must use method to guarentee environment variables have loaded.
export const getConnectionConfig = () => ({
  host: process.env.DB_URL,
  user: process.env.DB_USER || process.env.PGUSER, // Test environment uses PGUSER
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD, // Test environment uses PGPASSWORD
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_DISABLE_SSL === 'true'
      ? null
      : {
          // Test server cannot turn on ssl, so sets the env to disable it
          rejectUnauthorized: false,
        },
});
