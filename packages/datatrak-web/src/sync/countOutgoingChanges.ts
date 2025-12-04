import { DatabaseModel, LocalSystemFactModel } from '@tupaia/database';
import { FACT_LAST_SUCCESSFUL_SYNC_PUSH } from '@tupaia/constants';
import { isNullish } from '@tupaia/tsutils';

import { assertModelsForPush } from './assertModelsForPush';
import { getModelOutgoingChangesFilter } from './getModelOutgoingChangesFilter';

const countChangesForModel = async (
  model: DatabaseModel,
  tombstoneModel: DatabaseModel,
  since: number,
) => {
  const countFilter = getModelOutgoingChangesFilter(since);
  const changedRecordsCount = await model.count(countFilter);
  const deletedRecordsCount = await tombstoneModel.count({
    record_type: model.databaseRecord,
    ...countFilter,
  });

  return changedRecordsCount + deletedRecordsCount;
};

export const countOutgoingChanges = async (
  models: DatabaseModel[],
  tombstoneModel: DatabaseModel,
  localSystemFact: LocalSystemFactModel,
) => {
  assertModelsForPush(models);

  const lastSuccessfulSyncPush = await localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PUSH);
  const pushSince = isNullish(lastSuccessfulSyncPush) ? -1 : parseInt(lastSuccessfulSyncPush, 10);
  const changeCounts = await Promise.all(
    models.map(model => countChangesForModel(model, tombstoneModel, pushSince)),
  );
  return changeCounts.reduce((total, count) => total + count, 0);
};
