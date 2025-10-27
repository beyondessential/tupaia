import { SqlQuery } from '@tupaia/database';
import {
  FACT_CURRENT_SYNC_TICK,
  FACT_LAST_SUCCESSFUL_SYNC_PULL,
  FACT_LAST_SUCCESSFUL_SYNC_PUSH,
  FACT_PROJECTS_IN_SYNC,
} from '@tupaia/constants';

import { DatatrakWebModelRegistry } from '../types';

const TABLES_TO_KEEP = ['user_account', 'migrations', 'local_system_fact'];

const clearTables = async (
  models: DatatrakWebModelRegistry,
  schema: string,
  tablesToKeep: string[] = [],
) => {
  const tablesToTruncate = (await models.database.executeSql(
    `
    SELECT tablename AS table_name 
    FROM pg_tables 
    WHERE schemaname = ?
    ${tablesToKeep.length > 0 ? `AND tablename NOT IN ${SqlQuery.record(tablesToKeep)}` : ''}
  `,
    [schema, ...tablesToKeep],
  )) as { table_name: string }[];

  for (const { table_name: tableName } of tablesToTruncate) {
    await models.database.executeSql(`
      TRUNCATE TABLE ${tableName} CASCADE;
    `);
  }
};

const clearLocalSystemFacts = async (models: DatatrakWebModelRegistry) => {
  await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, -1);
  await models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, -1);
  await models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PUSH, -1);
  await models.localSystemFact.delete({ key: FACT_PROJECTS_IN_SYNC });
};

export const clearDatabase = async (models: DatatrakWebModelRegistry) => {
  // Clear public schema but still keep some tables
  await clearTables(models, 'public', TABLES_TO_KEEP);

  await clearLocalSystemFacts(models);
};
