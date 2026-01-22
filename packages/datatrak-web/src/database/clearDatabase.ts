import { SyncFact } from '@tupaia/constants';
import type { DatabaseSchemaName, PublicSchemaRecordName } from '@tupaia/database';
import { RECORDS, SCHEMA_NAMES, SqlQuery } from '@tupaia/database';
import type { DatatrakWebModelRegistry } from '../types';

const TABLES_TO_KEEP = [
  RECORDS.LOCAL_SYSTEM_FACT,
  RECORDS.MIGRATIONS,
  RECORDS.USER_ACCOUNT,
] as const satisfies PublicSchemaRecordName[];

const clearTables = async (
  models: DatatrakWebModelRegistry,
  schema: DatabaseSchemaName,
  tablesToKeep: PublicSchemaRecordName[] = [],
) => {
  const tablesToTruncate = await models.database.executeSql<
    { table_name: PublicSchemaRecordName }[]
  >(
    `
      SELECT tablename AS table_name
      FROM pg_tables
      WHERE schemaname = ?
      ${tablesToKeep.length > 0 ? `AND tablename NOT IN ${SqlQuery.record(tablesToKeep)}` : ''}
    `,
    [schema, ...tablesToKeep],
  );

  for (const { table_name: tableName } of tablesToTruncate) {
    await models.database.executeSql('TRUNCATE TABLE ?? CASCADE;', tableName);
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
  await clearTables(models, SCHEMA_NAMES.PUBLIC, TABLES_TO_KEEP);
  await clearLocalSystemFacts(models);
};
