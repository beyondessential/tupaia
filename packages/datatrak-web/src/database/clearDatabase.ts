import { SqlQuery } from '@tupaia/database';
import { DatatrakWebModelRegistry } from '../types';

const TABLES_TO_KEEP = ['user_account'];

const clearTables = async (
  models: DatatrakWebModelRegistry,
  schema: string,
  tablesToKeep: string[] = [],
) => {
  const tablesToTruncate = (await models.database.executeSql(`
    SELECT tablename AS table_name 
    FROM pg_tables 
    WHERE schemaname = ?
    ${tablesToKeep.length > 0 ? `AND tablename NOT IN ${SqlQuery.record(tablesToKeep)}` : ''}
  `, [schema, ...tablesToKeep])) as { table_name: string }[];

  for (const { table_name: tableName } of tablesToTruncate) {
    await models.database.executeSql(`
      TRUNCATE TABLE ${tableName} CASCADE;
    `);
  }
};

export const clearDatabase = async (models: DatatrakWebModelRegistry) => {
  // Clear public schema but still keep some tables
  await clearTables(models, 'public', TABLES_TO_KEEP); 
};
