import log from 'winston';

import {
  SYNC_DIRECTIONS,
  SYNC_LOOKUP_PENDING_UPDATE_FLAG,
  FilteredModelRegistry,
} from '@tupaia/sync';
import { DatabaseModel, TupaiaDatabase, DebugLogRecord } from '@tupaia/database';

import { buildSyncLookupSelect } from './buildSyncLookupSelect';
import { SyncLookupQueryDetails, SyncServerConfig, SyncServerModelRegistry } from '../types';

const updateLookupTableForModel = async (
  model: DatabaseModel,
  config: SyncServerConfig,
  since: number,
  syncLookupTick: number | null,
) => {
  const CHUNK_SIZE = config.maxRecordsPerSnapshotChunk;
  const { perModelUpdateTimeoutMs, avoidRepull } = config.lookupTable;

  const table = model.databaseRecord;

  let fromId = '';
  let totalCount = 0;
  const result: SyncLookupQueryDetails =
    typeof model.buildSyncLookupQueryDetails === 'function'
      ? (await model.buildSyncLookupQueryDetails()) || {}
      : {};
  const { select, joins, where } = result;

  while (fromId != null) {
    const [{ maxId, count }] = await model.database.executeSql(
      `
        WITH inserted AS (
          INSERT INTO sync_lookup (
            record_id,
            record_type,
            updated_at_sync_tick,
            pushed_by_device_id,
            data,

            project_ids
          )
          ${select || (await buildSyncLookupSelect(model))}
          FROM
            ${table}
          ${
            avoidRepull
              ? `LEFT JOIN sync_device_tick
                  ON persisted_at_sync_tick = ${table}.updated_at_sync_tick`
              : 'LEFT JOIN (select NULL as device_id) AS sync_device_ticks ON 1 = 1'
          }
          ${joins || ''}
          WHERE
          (${where || `${table}.updated_at_sync_tick > :since`})
          ${fromId ? `AND ${table}.id > :fromId` : ''}
          ORDER BY ${table}.id
          LIMIT :limit
          ON CONFLICT (record_id, record_type)
          DO UPDATE SET
            data = EXCLUDED.data,
            updated_at_sync_tick = EXCLUDED.updated_at_sync_tick,
            project_ids = EXCLUDED.project_ids,
            pushed_by_device_id = EXCLUDED.pushed_by_device_id
          RETURNING record_id
        )
        SELECT MAX(record_id) as "maxId",
          count(*) as "count"
        FROM inserted;
      `,
      {
        since,
        limit: CHUNK_SIZE,
        fromId,
        perModelUpdateTimeoutMs,
        updatedAtSyncTick: syncLookupTick,
      },
    );

    const chunkCount = parseInt(count, 10); // count should always be default to '0'
    fromId = maxId;
    totalCount += chunkCount;
  }

  log.info('updateLookupTable.updateLookupTableForModel', {
    model: model.databaseRecord,
    totalCount: totalCount,
  });

  return totalCount;
};

export const updateLookupTable = async (
  outgoingModels: FilteredModelRegistry,
  since: number,
  config: SyncServerConfig,
  syncLookupTick: number | null,
  debugObject: DebugLogRecord,
) => {
  const invalidModelNames = Object.values(outgoingModels)
    .filter(
      m =>
        ![SYNC_DIRECTIONS.BIDIRECTIONAL, SYNC_DIRECTIONS.PULL_FROM_CENTRAL].includes(
          m.syncDirection,
        ),
    )
    .map(m => m.tableName);

  if (invalidModelNames.length) {
    throw new Error(
      `Invalid sync direction(s) when pulling these models from central: ${invalidModelNames}`,
    );
  }

  let changesCount = 0;

  for (const model of Object.values(outgoingModels)) {
    try {
      const modelChangesCount = await updateLookupTableForModel(
        model,
        config,
        since,
        syncLookupTick,
      );

      changesCount += modelChangesCount || 0;
    } catch (e: any) {
      log.error(`Failed to update ${model.name} for lookup table`);
      log.debug(e);
      throw new Error(`Failed to update ${model.name} for lookup table: ${e.message}`);
    }
  }

  await debugObject.addInfo({ changesCount });
  log.info('updateLookupTable.countedAll', { count: changesCount, since });

  return changesCount;
};

export const updateSyncLookupPendingRecords = async (
  database: TupaiaDatabase,
  currentTick: number,
) => {
  await database.executeSql(
    `
      UPDATE sync_lookup
      SET updated_at_sync_tick = :currentTick
      WHERE updated_at_sync_tick = :pendingUpdateFlag;
    `,
    { currentTick, pendingUpdateFlag: SYNC_LOOKUP_PENDING_UPDATE_FLAG },
  );
};
