/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import DBMigrate from 'db-migrate';
import * as dotenv from 'dotenv';
import { requireEnv, getEnvVarOrDefault } from '@tupaia/utils';

dotenv.config(); // Load the environment variables into process.env

const exitWithError = error => {
  console.error(error.message);
  process.exit(1);
};

const migrationInstance = DBMigrate.getInstance(
  true,
  {
    cwd: `${__dirname}/patches`,
    config: {
      defaultEnv: 'tupaia',
      tupaia: {
        driver: 'pg',
        host: requireEnv('DB_URL'),
        port: getEnvVarOrDefault('DB_PORT', 5432),
        user: requireEnv('DB_MV_USER'),
        password: requireEnv('DB_MV_PASSWORD'),
        database: requireEnv('DB_NAME'),
        schema: requireEnv('DB_MV_USER'),
        ssl:
          process.env.DB_ENABLE_SSL === 'true'
            ? {
                // Test server cannot turn on ssl, so sets the env to disable it
                rejectUnauthorized: false,
              }
            : null,
      },
    },
  },
  async (migrator, internals, originalError, migrationError) => {
    if (originalError) {
      exitWithError(new Error(`db-migrate error: ${migrationError.message}`));
    }
    if (migrationError) {
      exitWithError(new Error(`Migration error: ${migrationError.message}`));
    }

    const { driver } = migrator;
    try {
      driver.close();
    } catch (err) {
      exitWithError(err);
    }
  },
);

migrationInstance.run();
