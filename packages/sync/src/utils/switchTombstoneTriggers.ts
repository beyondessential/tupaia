import { BaseDatabase, TABLES_WITH_TRIGGER_FOR_DELETE_QUERY } from '@tupaia/database';

export const switchTombstoneTriggers = async (database: BaseDatabase, enabled: boolean) => {
  const tablesWithTrigger: { table: string }[] = await database.executeSql(
    TABLES_WITH_TRIGGER_FOR_DELETE_QUERY,
  );

  const action = enabled ? 'ENABLE' : 'DISABLE';
  for (const { table } of tablesWithTrigger) {
    await database.executeSql(`
        ALTER TABLE "${table}" ${action} TRIGGER add_${table}_tombstone_on_delete;
      `);
  }
};
