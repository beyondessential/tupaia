import { BaseDatabase } from '@tupaia/database';

import { switchTombstoneTriggers } from './switchTombstoneTriggers';

export const withDeferredSyncSafeguards = async <T>(
  database: BaseDatabase,
  operation: () => Promise<T>,
): Promise<T> => {
  // Setup - defer constraints and disable tombstone trigger
  await database.executeSql(`
      SET CONSTRAINTS ALL DEFERRED;
    `);
  await switchTombstoneTriggers(database, false);

  try {
    return operation();
  } finally {
    // cleanup
    await database.executeSql(`
      SET CONSTRAINTS ALL IMMEDIATE;
    `);
    await switchTombstoneTriggers(database, true);
  }
};
