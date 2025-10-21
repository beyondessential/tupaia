import { DatabaseModel } from '@tupaia/database';

export const saveCreates = async (
  model: DatabaseModel,
  records: Record<string, any>[],
  batchSize = 1000,
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
  batchSize = 1000,
  progressCallback?: (recordsProcessed: number) => void,
) => {
  const recordsToSave = incomingRecords.filter(r => r.id);
  for (let i = 0; i < recordsToSave.length; i += batchSize) {
    const batch = recordsToSave.slice(i, i + batchSize);

    try {
      await Promise.all(batch.map(r => model.updateById(r.id, r)));
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

export const saveDeletes = async (
  model: DatabaseModel,
  recordsForDelete: Record<string, any>[],
  batchSize = 1000,
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
