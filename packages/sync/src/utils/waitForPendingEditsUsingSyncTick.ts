import type { BaseDatabase } from '@tupaia/database';

// wait for any locks using the current sync clock tick as the id - these locks are also
// taken during create/update triggers on synced tables, so this ensures that any pending
// transactions that involve a create/update of a record have finished
export const waitForPendingEditsUsingSyncTick = async <
  DatabaseT extends BaseDatabase = BaseDatabase,
  ReturnT = unknown,
>(
  database: DatabaseT,
  syncTick: number,
) => await database.executeSql<ReturnT>('SELECT pg_advisory_xact_lock(:syncTick);', { syncTick });
