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
    isDeleted: Boolean(r.is_deleted),
    data: sanitizeRecord(r),
  })) as SyncSnapshotAttributes[];
};

/**
 * Reads one model at a time, rather than all of them at once. `cancelIfAppIsWaiting` throws from
 * inside one of these reads, and `Promise.all` rejects on the first throw, so the transaction
 * would start rolling back with the sibling reads still outstanding against it — and nothing left
 * awaiting them to handle their rejections. PGlite serialises the reads on its single connection
 * anyway, so running them in turn costs nothing.
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
