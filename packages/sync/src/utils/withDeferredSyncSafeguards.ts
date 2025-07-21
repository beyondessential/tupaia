import { BaseDatabase } from '@tupaia/database';

import { switchTombstoneTriggers } from './switchTombstoneTriggers';

export const withDeferredSyncSafeguards = async <T>(
  database: BaseDatabase,
  operation: () => Promise<T>,
): Promise<T> => {
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
  await switchTombstoneTriggers(database, false);

  try {
    return operation();
  } finally {
    // Switch back to immediate mode
    await database.executeSql(`
      SET CONSTRAINTS ALL IMMEDIATE;
    `);

    // Re-enable tombstone triggers
    await switchTombstoneTriggers(database, true);
  }
};
