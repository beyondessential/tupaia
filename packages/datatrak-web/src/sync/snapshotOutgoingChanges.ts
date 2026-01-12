import log from 'winston';

import { DatabaseModel } from '@tupaia/database';
import { sanitizeRecord, SYNC_SESSION_DIRECTION, SyncSnapshotAttributes } from '@tupaia/sync';
import { assertModelsForPush } from './assertModelsForPush';
import { getModelOutgoingChangesFilter } from './getModelOutgoingChangesFilter';

const snapshotChangesForModel = async (model: DatabaseModel, since: number) => {
  const changedRecords = await model.find(getModelOutgoingChangesFilter(since));

  log.debug(
    `snapshotChangesForModel: Found ${changedRecords.length} for model ${model.databaseRecord} since ${since}`,
  );

  return changedRecords.map(r => ({
    direction: SYNC_SESSION_DIRECTION.OUTGOING,
    recordType: model.databaseRecord,
    recordId: r.id,
    data: sanitizeRecord(r),
  })) as SyncSnapshotAttributes[];
};

export const snapshotOutgoingChanges = async (models: DatabaseModel[], since: number) => {
  console.groupCollapsed('Snapshotting outgoing changes');
  const startTime = performance.now();

  assertModelsForPush(models);

  const modelChanges = await Promise.all(
    models.map(model => snapshotChangesForModel(model, since)),
  );

  console.groupEnd();
  console.log(`Snapshotted outgoing changes in ${performance.now() - startTime} ms`);

  return modelChanges.flat();
};
