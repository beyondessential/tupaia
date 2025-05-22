import { DatabaseModel } from '@tupaia/database';

export const saveCreates = async (model: DatabaseModel, records: Record<string, any>[]) => {
  console.log('model', model);
  await model.createMany(records);
};

export const saveUpdates = async (
  model: DatabaseModel,
  incomingRecords: Record<string, any>[],
  idToExistingRecord: Record<number, any>,
  isCentralServer: boolean,
) => {
  const recordsToSave = incomingRecords.filter(r => r.id); // TODO: merge records
  await Promise.all(recordsToSave.map(r => model.update({ id: r.id }, r)));
};

// model.update cannot update deleted_at field, so we need to do update (in case there are still any new changes even if it is being deleted) and destroy
export const saveDeletes = async (
  model: DatabaseModel,
  recordsForDelete: Record<string, any>[],
) => {
  if (recordsForDelete.length === 0) return;

  await model.delete({ id: recordsForDelete.map(r => r.id) });
};
