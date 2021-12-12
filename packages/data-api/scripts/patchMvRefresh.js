/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import DBMigrate from 'db-migrate';
import * as dotenv from 'dotenv';
import { requireEnv, getEnvVarOrDefault } from '@tupaia/utils';
import { getConnectionConfig } from '@tupaia/database';

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
        ...getConnectionConfig(),
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
