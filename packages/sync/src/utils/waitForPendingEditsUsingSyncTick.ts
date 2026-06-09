import type { BaseDatabase } from '@tupaia/database';

// wait for any locks using the current sync clock tick as the id - these locks are also
// taken during create/update triggers on synced tables, so this ensures that any pending
// transactions that involve a create/update of a record have finished
export const waitForPendingEditsUsingSyncTick = async <
  DatabaseT extends BaseDatabase = BaseDatabase,
>(
  database: DatabaseT,
  syncTick: number,
  options: { maxRetries?: number; retryDelayMs?: number } = {},
) => {
  await database.acquireAdvisoryLockByKey(syncTick, {
    ...options,
    lockDescription: `pending edits (syncTick: ${syncTick})`,
  });
};
