import { DatabaseModel } from '@tupaia/database';

export const saveCreates = async (model: DatabaseModel, records: Record<string, any>[], batchSize = 1000) => {
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await model.createMany(batch);
  }
};

export const saveUpdates = async (
  model: DatabaseModel,
  incomingRecords: Record<string, any>[],
  batchSize = 1000,
) => {
  const recordsToSave = incomingRecords.filter(r => r.id);
  for (let i = 0; i < recordsToSave.length; i += batchSize) {
    const batch = recordsToSave.slice(i, i + batchSize);

    await Promise.all(batch.map(r => model.update({ id: r.id }, r)));
  }
};

export const saveDeletes = async (
  model: DatabaseModel,
  recordsForDelete: Record<string, any>[],
) => {
  if (recordsForDelete.length === 0) {
    return;
  }

  await model.delete({ id: recordsForDelete.map(r => r.id) });
};
