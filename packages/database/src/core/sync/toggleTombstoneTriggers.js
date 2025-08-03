import { TABLES_WITH_TOMBSTONE_TRIGGER_QUERY } from './initSyncComponents';

export const toggleTombstoneTriggers = async (database, enabled) => {
  const tablesWithTrigger = await database.executeSql(TABLES_WITH_TOMBSTONE_TRIGGER_QUERY);

  const action = enabled ? 'ENABLE' : 'DISABLE';
  for (const { table } of tablesWithTrigger) {
    await database.executeSql(`
        ALTER TABLE "${table}" ${action} TRIGGER add_${table}_tombstone_on_delete;
      `);
  }
};
