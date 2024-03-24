/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
// @ts-expect-error db-migrate has no types unfortunately
import DBMigrate from 'db-migrate';

import * as dotenv from 'dotenv';
import { requireEnv } from '@tupaia/utils';
import { getConnectionConfig } from '@tupaia/database';

dotenv.config({
  path: [
    path.resolve(__dirname, '../../../env/.env.servers'),
    path.resolve(__dirname, '../../../env/.env.db'),
    '.env',
  ],
}); // Load the environment variables into process.env

const exitWithError = (error: Error) => {
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
        schema: requireEnv('DB_MV_USER'),
        ...getConnectionConfig({ userEnv: 'DB_MV_USER', passEnv: 'DB_MV_PASSWORD' }),
      },
    },
  },
  async (migrator: any, internals: any, originalError: Error, migrationError: Error) => {
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
      exitWithError(err as Error);
    }
  },
);

migrationInstance.run();
