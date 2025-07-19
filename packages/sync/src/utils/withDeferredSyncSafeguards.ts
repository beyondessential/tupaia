import { BaseDatabase } from '@tupaia/database';

import { switchTombstoneTrigger } from './saveIncomingChanges';

export const withDeferredSyncSafeguards = async <T>(
  database: BaseDatabase,
  operation: () => Promise<T>,
): Promise<T> => {
  // Setup - defer constraints and disable tombstone trigger
  await database.executeSql(`
      SET CONSTRAINTS ALL DEFERRED;
    `);
  await switchTombstoneTrigger(database, false);

  try {
    return operation();

  } finally {
    // cleanup
    await database.executeSql(`
      SET CONSTRAINTS ALL IMMEDIATE;
    `);
    await switchTombstoneTrigger(database, true);
  }
};
