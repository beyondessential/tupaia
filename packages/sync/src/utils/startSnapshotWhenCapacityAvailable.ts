import { sleep } from '@tupaia/utils';
import { TupaiaDatabase } from '@tupaia/database';

// TODO: Move to config model RN-1668
const NUMBER_CONCURRENT_PULL_SNAPSHOTS = 4;

const startSnapshotIfCapacityAvailable = async (database: TupaiaDatabase, sessionId: string) => {
  // work out how many sessions are currently in the snapshot phase
  const rows = (await database.executeSql(
    `
    WITH in_flight_snapshots AS (
      SELECT COUNT(*) AS count FROM sync_session
      WHERE snapshot_started_at IS NOT NULL
      AND snapshot_completed_at IS NULL
      AND errors IS NULL
      AND completed_at IS NULL
    )
    UPDATE sync_session
    SET snapshot_started_at = NOW()
    FROM in_flight_snapshots
    WHERE id = :sessionId
    AND in_flight_snapshots.count < :numberConcurrentPullSnapshots
    RETURNING id;
    `,
    {
      sessionId,
      numberConcurrentPullSnapshots: NUMBER_CONCURRENT_PULL_SNAPSHOTS,
    },
  )) as { id: string }[];
  const success = rows.length > 0;
  return success;
};

export const startSnapshotWhenCapacityAvailable = async (
  database: TupaiaDatabase,
  sessionId: string,
) => {
  // wait for there to be enough capacity to start a snapshot
  while (!(await startSnapshotIfCapacityAvailable(database, sessionId))) {
    await sleep(500); // wait for half a second
  }
};
