import log from 'winston';

import { DatabaseModel } from '@tupaia/database';
import { sanitizeRecord, SYNC_SESSION_DIRECTION, SyncSnapshotAttributes } from '@tupaia/sync';
import { assertModelsForPush } from './assertModelsForPush';
import { getModelOutgoingChangesFilter } from './getModelOutgoingChangesFilter';

const snapshotChangesForModel = async (
  model: DatabaseModel,
  tombstoneModel: DatabaseModel,
  since: number,
) => {
  const changedRecords = await model.find({
    ...getModelOutgoingChangesFilter(since),
  });
  const deletedRecords = await tombstoneModel.find({
    record_type: model.databaseRecord,
    ...getModelOutgoingChangesFilter(since),
  });

  const recordsChanged = [...changedRecords, ...deletedRecords];
  log.debug(
    `snapshotChangesForModel: Found ${recordsChanged.length} for model ${model.databaseRecord} since ${since}`,
  );

  return recordsChanged.map(r => ({
    direction: SYNC_SESSION_DIRECTION.OUTGOING,
    recordType: model.databaseRecord,
    recordId: r.id,
    data: sanitizeRecord(r),
  })) as SyncSnapshotAttributes[];
};

export const snapshotOutgoingChanges = async (
  models: DatabaseModel[],
  tombstoneModel: DatabaseModel,
  since: number,
) => {
  assertModelsForPush(models);

  const modelChanges = await Promise.all(
    models.map(model => snapshotChangesForModel(model, tombstoneModel, since)),
  );
  return modelChanges.flat();
};
