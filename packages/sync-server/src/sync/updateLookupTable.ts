import log from 'winston';

import { SyncDirections, SyncTickFlags } from '@tupaia/constants';
import { DatabaseModel, TupaiaDatabase, buildSyncLookupSelect } from '@tupaia/database';

import { SyncLookupQueryDetails, SyncServerConfig } from '../types';

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
  const hasCustomLookupQuery =
    'buildSyncLookupQueryDetails' in model &&
    typeof model.buildSyncLookupQueryDetails === 'function';
  const result: SyncLookupQueryDetails = hasCustomLookupQuery
    ? await (model.buildSyncLookupQueryDetails as Function)()
    : {};

  const { ctes, select, joins, where, groupBy } = result || {};
  const allGroupBy = groupBy ? [...groupBy, 'sync_device_tick.device_id'] : null;

  log.info('updateLookupTable.updateLookupTableForModel starting', {
    model: model.databaseRecord,
  });

  while (fromId != null) {
    const [{ maxId, count }] = await model.database.executeSql(
      `
        WITH
        ${ctes ? `${ctes.join('\n')}, \n` : ''}
        inserted AS (
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
              : 'LEFT JOIN (select NULL as device_id) AS sync_device_tick ON 1 = 1'
          }
          ${joins || ''}
          WHERE
          (${where || `${table}.updated_at_sync_tick > :since`})
          ${fromId ? `AND ${table}.id > :fromId` : ''}
          ${allGroupBy ? `GROUP BY ${allGroupBy.join(', ')}` : ''}
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
          COUNT(*)::int as "count"
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

    const chunkCount = count; // count should always default to '0'
    fromId = maxId;
    totalCount += chunkCount;

    log.info('updateLookupTable.updateLookupTableForModel', {
      model: model.databaseRecord,
      chunkCount,
    });
  }

  return totalCount;
};

export const updateLookupTable = async (
  outgoingModels: DatabaseModel[],
  since: number,
  config: SyncServerConfig,
  syncLookupTick: number | null,
) => {
  const invalidModelNames = outgoingModels
    .filter(
      m =>
        ![SyncDirections.BIDIRECTIONAL, SyncDirections.PULL_FROM_CENTRAL].includes(
          (m.constructor as typeof DatabaseModel).syncDirection,
        ),
    )
    .map(m => m.databaseRecord);

  if (invalidModelNames.length) {
    throw new Error(
      `Invalid sync direction(s) when pulling these models from central: ${invalidModelNames}`,
    );
  }

  let changesCount = 0;

  for (const model of outgoingModels) {
    try {
      const modelChangesCount = await updateLookupTableForModel(
        model,
        config,
        since,
        syncLookupTick,
      );

      changesCount += modelChangesCount || 0;
    } catch (e: any) {
      log.error(`Failed to update ${model.databaseRecord} for lookup table`);
      log.debug(e);
      throw new Error(`Failed to update ${model.databaseRecord} for lookup table: ${e.message}`);
    }
  }

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
      WHERE updated_at_sync_tick = :pendingUpdateSyncTick;
    `,
    { currentTick, pendingUpdateSyncTick: SyncTickFlags.LOOKUP_PENDING_UPDATE },
  );
};
