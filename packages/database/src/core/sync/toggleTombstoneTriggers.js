import { TABLES_WITH_TOMBSTONE_TRIGGER_QUERY } from './initSyncComponents';

export const toggleTombstoneTriggers = async (database, enabled) => {
  const tablesWithTrigger = await database.executeSql(TABLES_WITH_TOMBSTONE_TRIGGER_QUERY);

  const action = enabled ? 'ENABLE' : 'DISABLE';
  for (const { table } of tablesWithTrigger) {
    if (table === 'user_account') {
      const locks = await database.executeSql(`
        SELECT 
            l.locktype,
            l.database,
            l.relation::regclass,
            l.page,
            l.tuple,
            l.virtualxid,
            l.transactionid,
            l.mode,
            l.granted,
            a.usename,
            a.query,
            a.query_start,
            a.state,
            a.pid
        FROM pg_locks l
        LEFT JOIN pg_stat_activity a ON l.pid = a.pid
        WHERE l.relation = 'user_account'::regclass
        ORDER BY l.granted, a.query_start;
      `);
      console.log('lockssss', locks);
      console.trace();
    }
    await database.executeSql(`
        ALTER TABLE "${table}" ${action} TRIGGER add_${table}_tombstone_on_delete;
      `);
  }
};
