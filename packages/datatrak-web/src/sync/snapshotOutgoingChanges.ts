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
    varcharId: r.id,
    recordId: r.id,
    isDeleted: !!r.deleted_at,
    recordType: model.databaseRecord,
    data: sanitizeRecord(r),
    direction: SYNC_SESSION_DIRECTION.OUTGOING,
  })) as SyncSnapshotAttributes[];
};

/**
 * Reads one model at a time, rather than all of them at once, so that `cancelIfAppIsWaiting` can
 * throw between models without leaving reads running against a transaction that is rolling back.
 * PGlite serialises them on its single connection anyway, so nothing is lost by doing so.
 *
 * @param cancelIfAppIsWaiting Called before reading each model’s changes; throws to cancel
 */
export const snapshotOutgoingChanges = async (
  models: DatabaseModel[],
  since: number,
  cancelIfAppIsWaiting?: () => void,
) => {
  console.groupCollapsed('Snapshotting outgoing changes');
  const startTime = performance.now();

  assertModelsForPush(models);

  const modelChanges: SyncSnapshotAttributes[][] = [];
  for (const model of models) {
    cancelIfAppIsWaiting?.();
    modelChanges.push(await snapshotChangesForModel(model, since));
  }

  console.groupEnd();
  console.log(`Snapshotted outgoing changes in ${performance.now() - startTime} ms`);

  return modelChanges.flat();
};
