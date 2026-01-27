import { SyncTickFlags } from '@tupaia/constants';
import { DatabaseModel } from '@tupaia/database';

export const saveCreates = async (
  model: DatabaseModel,
  records: Record<string, any>[],
  batchSize = 500,
  progressCallback?: (recordsProcessed: number) => void,
) => {
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    try {
      await model.createMany(batch);
    } catch (originalError: any) {
      // try records individually, some may succeed and we want to capture the
      // specific one with the error
      await Promise.all(
        batch.map(async row => {
          try {
            await model.create(row);
          } catch (error: any) {
            throw new Error(`Insert failed for record '${row.id}': ${originalError.message}`);
          }
        }),
      );
    }

    progressCallback?.(batch.length);
  }
};

export const saveUpdates = async (
  model: DatabaseModel,
  incomingRecords: Record<string, any>[],
  isCentralServer: boolean,
  batchSize = 500,
  progressCallback?: (recordsProcessed: number) => void,
) => {
  const recordsToSave = incomingRecords.filter(r => r.id);
  for (let i = 0; i < recordsToSave.length; i += batchSize) {
    const batch = recordsToSave.slice(i, i + batchSize);

    try {
      if (isCentralServer) {
        await Promise.all(
          batch.map(async row => {
            await model.updateById(row.id, row);
          }),
        );
      } else {
        await bulkUpdateForClient(model, batch);
      }
    } catch (originalError: any) {
      // try records individually, some may succeed and we want to capture the
      // specific one with the error
      await Promise.all(
        batch.map(async row => {
          try {
            await model.updateById(row.id, row);
          } catch (error: any) {
            throw new Error(`Update failed for record '${row.id}': ${originalError.message}`);
          }
        }),
      );
    }

    progressCallback?.(batch.length);
  }
};

/**
 * For pglite, a single update's performance is very slow. It is acceptable for a few updates,
 * but when syncing many updates, it is not acceptable.
 * Using bulk insert on conflict has much better performance than updating records individually
 */
const bulkUpdateForClient = async (model: DatabaseModel, batch: Record<string, any>[]) => {
  const attributes = Object.keys(await model.fetchSchema());
  const allColumns = new Set(batch.flatMap(Object.keys));
  void allColumns.delete('updated_at_sync_tick');
  const attributesToMerge = attributes.filter(col => allColumns.has(col));
  // This is really a hack to get the updated_at_sync_tick value to be correctly set to the incoming value from the central server
  // This is because when doing INSERT INTO ON CONFLICT, the set_updated_at_sync_tick() is triggered twice by the following workflow::
  // 1. First trigger before inserting the record
  // 2. The insert is skipped due to the on conflict merge
  // 3. Second trigger before updating the record
  // Hence, we need to explicitly set the updated_at_sync_tick to the incoming value from the central server manually when merging during update
  const columnsToMerge = {
    ...Object.fromEntries(
      attributesToMerge.map(col => [col, model.database.connection.raw('EXCLUDED.??', [col])]),
    ),
    updated_at_sync_tick: SyncTickFlags.INCOMING_FROM_CENTRAL_SERVER,
  };

  // For pglite, using bulk insert on conflict has much better performance than updating records individually
  await model.createMany(batch, { onConflictMerge: ['id'], columnsToMerge });
};

export const saveDeletes = async (
  model: DatabaseModel,
  recordsForDelete: Record<string, any>[],
  batchSize = 500,
  progressCallback?: (recordsProcessed: number) => void,
) => {
  for (let i = 0; i < recordsForDelete.length; i += batchSize) {
    const batch = recordsForDelete.slice(i, i + batchSize);
    try {
      await model.delete({ id: batch.map(r => r.id) });
    } catch (originalError: any) {
      // try records individually, some may succeed and we want to capture the
      // specific one with the error
      await Promise.all(
        batch.map(async row => {
          try {
            await model.delete({ id: row.id });
          } catch (error: any) {
            throw new Error(`Delete failed for record '${row.id}': ${originalError.message}`);
          }
        }),
      );
    }

    progressCallback?.(batch.length);
  }
};
