import log from 'winston';

import { getSnapshotTableName, NON_SYNCING_TABLES, SYNC_SESSION_DIRECTION } from '@tupaia/sync';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { SyncServerConfig } from '../types';

type SnapshotOutgoingChangesResult = {
  maxId: string;
  count: string;
};

export const snapshotOutgoingChanges = async (
  database: TupaiaDatabase,
  models: ModelRegistry,
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
  const recordTypes = Object.values(models)
    .filter(m => !NON_SYNCING_TABLES.includes(m.databaseRecord) && !!m.databaseRecord)
    .map(m => m.databaseRecord);
    
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
          data
        )
        SELECT
          id,
          '${SYNC_SESSION_DIRECTION.OUTGOING}',
          record_type,
          record_id,
          updated_at_sync_tick,
          data
        FROM
          sync_lookup
        WHERE true
        ${fromId ? `AND id > :fromId` : ''}
        AND (
          project_ids IS NULL
          OR
          project_ids::text[] @> ARRAY[:projectIds]
        )
        AND record_type IN (${recordTypes.map(r => `'${r}'`).join(',')})
        ${
          avoidRepull && deviceId
            ? 'AND (pushed_by_device_id <> :deviceId OR pushed_by_device_id IS NULL)'
            : ''
        }
        ORDER BY id
        LIMIT :limit
        RETURNING sync_lookup_id
      )
      SELECT MAX(sync_lookup_id) as "maxId",
        count(*) as "count"
      FROM inserted;
    `,
      {
        sessionId,
        // since,
        // include replacement params used in some model specific sync filters outside of this file
        // see e.g. Referral.buildSyncFilter
        projectIds,
        limit: CHUNK_SIZE,
        fromId,
        recordTypes,
        deviceId,
      },
    )) as SnapshotOutgoingChangesResult[];

    const chunkCount = parseInt(count, 10); // count should always be default to '0'

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
