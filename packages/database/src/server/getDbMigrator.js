import DBMigrate from 'db-migrate';
import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';

import { copyDirectory, createDirectory } from '@tupaia/server-utils';
import { getConnectionConfig } from './getConnectionConfig';
import { runPostMigration } from './runPostMigration';

const MIGRATIONS_DIR = path.resolve(__dirname, '../core/migrations');
const SERVER_MIGRATION_DIR = path.resolve(__dirname, `../core/server-migrations-${Date.now()}`);

const exitWithError = error => {
  console.error(error.message);
  process.exit(1);
};

const resetMigrationFolder = () => {
  fs.rmSync(SERVER_MIGRATION_DIR, { recursive: true, force: true });
  winston.info(`Reset migration directory: ${SERVER_MIGRATION_DIR}`);
};

/**
 * Removes all migrations that are not server migrations
 */
export const removeNonServerMigrations = () => {
  const migrationFiles = fs
    .readdirSync(SERVER_MIGRATION_DIR)
    .filter(file => path.extname(file) === '.js');

  // Read each file's contents
  for (const file of migrationFiles) {
    const filePath = path.join(SERVER_MIGRATION_DIR, file);
    const migrationModule = require(filePath);
    // Some migrations don't have a _meta object
    const targets = migrationModule._meta?.targets || [];
    const isNotLegacyMigration = Boolean(migrationModule._meta?.targets);

    // For legacy migrations with no targets, we accept them
    if (isNotLegacyMigration && !targets.includes('server')) {
      fs.unlinkSync(filePath);
      winston.info(`Excluding non-server migration file: ${filePath}`);
    }
  }
};

const cliCallback = async (migrator, _internals, originalError, migrationError) => {
  try {
    if (originalError) {
      exitWithError(new Error(`db-migrate error: ${originalError.message}`));
    }
    if (migrationError) {
      exitWithError(new Error(`Migration error: ${migrationError.message}`));
    }

    const { driver } = migrator;
    await runPostMigration(driver);
  } catch (error) {
    exitWithError(new Error(`Post migration error: ${error.message}`));
  } finally {
    resetMigrationFolder();
  }
};

const appCallback = async (migrator, internals, callback, error) => {
  try {
    if (error) {
      throw error;
    }

    const { driver } = migrator;
    await runPostMigration(driver);
  } finally {
    resetMigrationFolder();
    // This needs to be called, otherwise the process will hang
    if (callback) {
      callback();
    }
  }
};

export const getDbMigrator = (forCli = false) => {
  // Ensure cleanup runs even if the process exits unexpectedly (e.g. connection timeout)
  process.on('exit', resetMigrationFolder);

  const instance = DBMigrate.getInstance(
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
      cmdOptions: {
        'migrations-dir': SERVER_MIGRATION_DIR,
      },
    },
    forCli ? cliCallback : appCallback,
  );

  // No need to exclude non-server migrations if we're creating a new migration
  if (!process.argv.includes('create')) {
    // 'core/migrations' folder is shared between server and browser
    // We need to exclude non-server migrations before they are run
    // ie: excluding migrations that have _meta.targets.includes('browser')
    // This hook is called BEFORE the migrations are run,
    // so we temporarily remove non-server migrations before they are run
    instance.registerAPIHook(() => {
      fs.rmSync(SERVER_MIGRATION_DIR, { recursive: true, force: true });
      createDirectory(SERVER_MIGRATION_DIR);
      copyDirectory(MIGRATIONS_DIR, SERVER_MIGRATION_DIR);
      removeNonServerMigrations();
    });
  }

  return instance;
};
