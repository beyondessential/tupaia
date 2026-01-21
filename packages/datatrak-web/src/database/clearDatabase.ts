import { SyncFact } from '@tupaia/constants';
import { DatabaseRecordName, SqlQuery } from '@tupaia/database';
import { DatatrakWebModelRegistry } from '../types';

const TABLES_TO_KEEP = [
  'local_system_fact',
  'migrations',
  'user_account',
] as const satisfies DatabaseRecordName[];

const clearTables = async (
  models: DatatrakWebModelRegistry,
  schema: 'logs' | 'mvrefresh' | 'public' | 'sync_snapshots',
  tablesToKeep: DatabaseRecordName[] = [],
) => {
  const tablesToTruncate = await models.database.executeSql<{ table_name: DatabaseRecordName }[]>(
    `
      SELECT tablename AS table_name
      FROM pg_tables
      WHERE schemaname = ?
      ${tablesToKeep.length > 0 ? `AND tablename NOT IN ${SqlQuery.record(tablesToKeep)}` : ''}
    `,
    [schema, ...tablesToKeep],
  );

  for (const { table_name: tableName } of tablesToTruncate) {
    await models.database.executeSql(`
      TRUNCATE TABLE ${tableName} CASCADE;
    `);
  }
};

const clearLocalSystemFacts = async (models: DatatrakWebModelRegistry) => {
  await models.localSystemFact.set(SyncFact.CURRENT_SYNC_TICK, '-1');
  await models.localSystemFact.set(SyncFact.LAST_SUCCESSFUL_SYNC_PULL, '-1');
  await models.localSystemFact.set(SyncFact.LAST_SUCCESSFUL_SYNC_PUSH, '-1');
  await models.localSystemFact.delete({ key: SyncFact.PROJECTS_IN_SYNC });
};

export const clearDatabase = async (models: DatatrakWebModelRegistry) => {
  // Clear public schema but still keep some tables
  await clearTables(models, 'public', TABLES_TO_KEEP);

  await clearLocalSystemFacts(models);
};
