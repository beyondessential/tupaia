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
  try {
    fs.rmSync(SERVER_MIGRATION_DIR, { recursive: true, force: true });
    winston.info(`Reset migration directory: ${SERVER_MIGRATION_DIR}`);
  } catch (error) {
    winston.error(`Error removing directory ${SERVER_MIGRATION_DIR}:`, error);
  }
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
      resetMigrationFolder();
      createDirectory(SERVER_MIGRATION_DIR);
      copyDirectory(MIGRATIONS_DIR, SERVER_MIGRATION_DIR);
      removeNonServerMigrations();
    });
  }

  return instance;
};

/**
 * Advisory-lock key held for the duration of a server migration run. Other services probe it
 * (see isMigrationInProgress) to defer work that would otherwise error against a half-migrated
 * schema or block the migration's DDL — e.g. sync-server's SyncLookupPopulator reading `entity`
 * while a migration needs to ALTER it.
 */
export const DB_MIGRATION_ADVISORY_LOCK_KEY = 'tupaia-db-migration';

/**
 * Runs pending server migrations while holding DB_MIGRATION_ADVISORY_LOCK_KEY. The lock lets
 * other services detect that a migration is in progress, and serialises concurrent migrators
 * (a second caller blocks until the first finishes, then finds nothing pending). The migrations
 * themselves run on db-migrate's own connection; the wrapping transaction only holds the lock.
 *
 * @param {import('../server/TupaiaDatabase').TupaiaDatabase} database
 */
export const runServerMigrations = async database => {
  await database.wrapInTransaction(async transactingDatabase => {
    await transactingDatabase.acquireAdvisoryLock(DB_MIGRATION_ADVISORY_LOCK_KEY);
    await getDbMigrator().up();
  });
};

/**
 * Non-blocking probe: is a server migration currently running?
 *
 * @param {import('../core/BaseDatabase').BaseDatabase} database
 * @returns {Promise<boolean>}
 */
export const isMigrationInProgress = database =>
  database.isAdvisoryLockTaken(DB_MIGRATION_ADVISORY_LOCK_KEY);
