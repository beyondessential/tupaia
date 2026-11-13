import { BaseDatabase, ModelRegistry, browserModelClasses, migrate } from '@tupaia/database';

import { DatatrakWebModelRegistry } from '../types';
import { DatatrakDatabase } from './DatatrakDatabase';
import { getConnectionConfig } from './getConnectionConfig';

/**
 * Coarse stages of database startup, reported so the loading screen can say which one is running.
 *
 * On a low-spec device the whole sequence can take minutes — PGlite has to boot Postgres compiled
 * to WebAssembly, and on first run also create the schema — and without this it is impossible to
 * tell a slow start from a stuck one without attaching a debugger.
 */
export type DatabaseStartupStage = 'connecting' | 'migrating';

export const createDatabase = async (
  onStage?: (stage: DatabaseStartupStage) => void,
): Promise<{
  database: DatatrakDatabase;
  models: DatatrakWebModelRegistry;
}> => {
  onStage?.('connecting');
  const database = new DatatrakDatabase();
  // Connect as its own step, so that booting PGlite is reported separately from running migrations
  await database.waitUntilConnected();

  // `waitUntilConnected` only waits for the knex object; PGlite itself is still booting — on a
  // slow first run (initdb, then persisting the data directory) that can take longer than knex's
  // 60-second connection-acquisition timeout, and the first query would fail with 'Knex: Timeout
  // acquiring a connection'. Wait for PGlite directly, with no deadline, before any query runs.
  await getConnectionConfig().pglite.waitReady;

  onStage?.('migrating');
  await migrate(database);

  const models = new ModelRegistry(
    database as BaseDatabase,
    browserModelClasses,
  ) as DatatrakWebModelRegistry;

  return { database, models };
};
