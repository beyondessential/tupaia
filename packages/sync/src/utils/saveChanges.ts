import { DatabaseModel } from '@tupaia/database';

export const saveCreates = async (
  model: DatabaseModel,
  records: Record<string, any>[],
  batchSize = 1000,
  progressCallback?: (recordsProcessed: number) => void,
) => {
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await model.createMany(batch);
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

    await Promise.all(batch.map(r => model.update({ id: r.id }, r)));
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
    await model.delete({ id: batch.map(r => r.id) });
    progressCallback?.(batch.length);
  }
};
