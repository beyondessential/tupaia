/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import DBMigrate from 'db-migrate';
import { runPostMigration } from './runPostMigration';
import { getConnectionConfig } from './getConnectionConfig';

const exitWithError = error => {
  console.error(error.message);
  process.exit(1);
};

const cliCallback = async (migrator, internals, originalError, migrationError) => {
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
};

const appCallback = async (migrator, internals, callback, error) => {
  if (error) {
    throw error;
  }

  const { driver } = migrator;
  await runPostMigration(driver);
};

export const getDbMigrator = (forCli = false) =>
  DBMigrate.getInstance(
    true,
    {
      cwd: __dirname,
      config: {
        defaultEnv: 'tupaia',
        tupaia: {
          driver: 'pg',
          ...getConnectionConfig(),
        },
      },
    },
    forCli ? cliCallback : appCallback,
  );
