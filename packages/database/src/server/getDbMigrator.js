import DBMigrate from 'db-migrate';
import path from 'path';
import fs from 'fs';
import winston from 'winston';

import { copyDirectory, removeDirectoryIfExists, createDirectory } from '@tupaia/server-utils';

import { runPostMigration } from './runPostMigration';
import { getConnectionConfig } from './getConnectionConfig';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'src/core/migrations');
const MIGRATIONS_BACKUP_DIR = path.resolve(process.cwd(), 'src/core/server-migrations-backup');

const exitWithError = error => {
  console.error(error.message);
  process.exit(1);
};

const resetMigrationFolders = () => {
  copyDirectory(MIGRATIONS_BACKUP_DIR, MIGRATIONS_DIR);
  removeDirectoryIfExists(MIGRATIONS_BACKUP_DIR);
};

/**
 * Removes all migrations that are not server migrations
 */
export const removeNonServerMigrations = async () => {
  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => path.extname(file) === '.js');

  // Read each file's contents
  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const migrationModule = require(filePath);
    // Some migrations don't have a _meta object
    const targets = migrationModule._meta?.targets || [];
    const isNotLegacyMigration = Boolean(migrationModule._meta?.targets);

    // For legacy migrations with now targets, we accept them
    if (isNotLegacyMigration && !targets.includes('server')) {
      fs.unlinkSync(filePath);
      winston.info(`Excluding non-server migration file: ${filePath}`);
    }
  }
};

const cliCallback = async (migrator, internals, originalError, migrationError) => {
  if (originalError) {
    exitWithError(new Error(`db-migrate error: ${migrationError.message}`));
  }
  if (migrationError) {
    exitWithError(new Error(`Migration error: ${migrationError.message}`));
  }

  resetMigrationFolders();

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

  resetMigrationFolders();

  const { driver } = migrator;
  await runPostMigration(driver);
  // This needs to be called, otherwise the process will hang
  if (callback) {
    callback();
  }
};

export const getDbMigrator = (forCli = false) => {
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
        'migrations-dir': MIGRATIONS_DIR,
      },
    },
    forCli ? cliCallback : appCallback,
  );

  // // 'core/migrations' folder is shared between server and browser
  // // We need to exclude non-server migrations before they are run
  // // ie: excluding migrations that have _meta.targets.includes('browser')
  // // This hook is called BEFORE the migrations are run,
  // // so we temporarily remove non-server migrations before they are run
  // instance.registerAPIHook(async () => {
  //   removeDirectoryIfExists(MIGRATIONS_BACKUP_DIR);
  //   createDirectory(MIGRATIONS_BACKUP_DIR);
  //   copyDirectory(MIGRATIONS_DIR, MIGRATIONS_BACKUP_DIR);
  //   removeNonServerMigrations();
  // });

  return instance;
};
