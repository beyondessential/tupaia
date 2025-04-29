import type { TupaiaDatabase } from '@tupaia/database';

interface PendingEditTickResult {
  tick: number;
}

export const getSyncTicksOfPendingEdits = async (database: TupaiaDatabase) => {
  // Get the keys (ie: syncTicks) of all the in-flight transaction locks of pending edits.
  // Since advisory locks are global, and:
  // - in-flight transaction locks are 'ShareLock'
  // - sync snapshot locks which are `ExclusiveLock`
  // => Only select for in-flight transaction locks by filtering for `ShareLock`
  // to avoid clashing with the sync snapshot locks
  const results = (await database.executeSql(
    `
      SELECT objid AS tick FROM pg_locks
      WHERE locktype = 'advisory'
      AND mode = 'ShareLock'
    `,
  )) as PendingEditTickResult[];

  return results?.map((r: PendingEditTickResult) => r.tick);
};
