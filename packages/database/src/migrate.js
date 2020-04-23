/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import DBMigrate from 'db-migrate';
import {} from 'dotenv/config'; // Load the environment variables into process.env
import { runPostMigration } from './runPostMigration';
import { getConnectionConfig } from './getConnectionConfig';

const exitWithError = error => {
  console.error(error.message);
  process.exit(1);
};

const migrationInstance = DBMigrate.getInstance(
  true,
  {
    cwd: `${__dirname}/migrations`,
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

    try {
      const { driver } = migrator;
      await runPostMigration(driver);
    } catch (error) {
      exitWithError(new Error(`Post migration error: ${error.message}`));
    }
  },
);

migrationInstance.run();
