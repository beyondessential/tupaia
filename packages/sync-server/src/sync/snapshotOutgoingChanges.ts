import log from 'winston';

import { getSnapshotTableName, SYNC_SESSION_DIRECTION } from '@tupaia/sync';
import { DatabaseModel, SqlQuery, TupaiaDatabase } from '@tupaia/database';
import { SyncServerConfig } from '../types';

type SnapshotOutgoingChangesResult = {
  maxId: string;
  count: string;
};

export const snapshotOutgoingChanges = async (
  database: TupaiaDatabase,
  models: DatabaseModel[],
  since: number,
  sessionId: string,
  deviceId: string,
  projectIds: string[],
  config: SyncServerConfig,
): Promise<number> => {
  let fromId = '';
  let totalCount = 0;
  const snapshotTableName = getSnapshotTableName(sessionId);
  const CHUNK_SIZE = config.maxRecordsPerSnapshotChunk;
  const avoidRepull = config.lookupTable.avoidRepull;
  const recordTypes = models.map(m => m.databaseRecord);

  while (fromId != null) {
    const [{ maxId, count }] = (await database.executeSql(
      `
      WITH inserted AS (
        INSERT INTO ${snapshotTableName} (
          sync_lookup_id,
          direction,
          record_type,
          record_id,
          saved_at_sync_tick,
          data,
          is_deleted
        )
        SELECT
          id,
          '${SYNC_SESSION_DIRECTION.OUTGOING}',
          record_type,
          record_id,
          updated_at_sync_tick,
          data,
          is_deleted
        FROM
          sync_lookup
        WHERE updated_at_sync_tick > ?
        ${fromId ? `AND id > ?` : ''}
        AND (
          project_ids IS NULL
          OR
          project_ids::text[] && ${SqlQuery.array(projectIds)}
        )
        AND record_type IN ${SqlQuery.record(recordTypes)}
        ${
          avoidRepull && deviceId
            ? 'AND (pushed_by_device_id <> ? OR pushed_by_device_id IS NULL)'
            : ''
        }
        ORDER BY id
        LIMIT ?
        RETURNING sync_lookup_id
      )
      SELECT  
        MAX(sync_lookup_id) as "maxId",
        COUNT(*) as "count"
      FROM inserted;
    `,
      [
        since,
        ...(fromId ? [fromId] : []),
        ...projectIds,
        ...recordTypes,
        ...(avoidRepull && deviceId ? [deviceId] : []),
        CHUNK_SIZE,
      ],
    )) as SnapshotOutgoingChangesResult[];

    const chunkCount = parseInt(count, 10); // count should always default to '0'

    fromId = maxId;
    totalCount += chunkCount;
  }

  log.info('snapshotOutgoingChangesFromSyncLookup.countedAll', {
    count: totalCount,
    since,
    sessionId,
    deviceId,
  });

  return totalCount;
};
