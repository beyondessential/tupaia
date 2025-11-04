import { BaseDatabase, toggleTombstoneTriggers } from '@tupaia/database';

export const withDeferredSyncSafeguards = async <
  ReturnT = unknown,
  DatabaseT extends BaseDatabase = BaseDatabase,
>(
  database: DatabaseT,
  operation: () => Promise<ReturnT>,
): Promise<ReturnT> => {
  if (!database.isWithinTransaction) {
    throw new Error('withDeferredSyncSafeguards must be called within a transaction');
  }

  /**
   * Defer foreign key constraint assertions until the end of the transaction.
   *
   * This prevents constraint violations during data synchronization when dealing with
   * self-referencing foreign keys (e.g., entity.parent_id, permission_group.parent_id).
   *
   * Without deferral, these constraints would be checked immediately upon insertion,
   * causing failures when parent records haven't been inserted yet. The hierarchical
   * nature of this data makes it complicated to guarantee correct insertion order.
   *
   * Note: Only constraints explicitly altered to be DEFERRABLE will be affected.
   * Standard foreign key constraints continue to be enforced immediately.
   */
  await database.executeSql(`
    SET CONSTRAINTS ALL DEFERRED;
  `);

  // Disable tombstone triggers to avoid syncing deletion
  // also put the records into tombstone table
  await toggleTombstoneTriggers(database, false);

  const results = await operation();

  // The function is always wrapped inside a transaction, 
  // If the operation fails, the transaction will be rolled back.
  // So even though the logic below to switch back to immediate mode and re-enable tombstone triggers are not run
  // the transaction will still rollback everything.

  // Switch back to immediate mode
  await database.executeSql(`
      SET CONSTRAINTS ALL IMMEDIATE;
    `);

  // Re-enable tombstone triggers
  await toggleTombstoneTriggers(database, true);

  return results;
};
