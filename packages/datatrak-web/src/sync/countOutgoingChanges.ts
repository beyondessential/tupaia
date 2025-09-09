import { DatabaseModel, LocalSystemFactModel } from '@tupaia/database';
import { FACT_LAST_SUCCESSFUL_SYNC_PUSH } from '@tupaia/constants';

import { assertModelsForPull } from './assertModelsForPull';
import { getModelOutgoingChangesFilter } from './getModelOutgoingChangesFilter';

const countChangesForModel = async (
  model: DatabaseModel,
  tombstoneModel: DatabaseModel,
  since: number,
) => {
  const changedRecordsCount = await model.count({
    ...getModelOutgoingChangesFilter(since),
  });
  const deletedRecordsCount = await tombstoneModel.count({
    record_type: model.databaseRecord,
    ...getModelOutgoingChangesFilter(since),
  });

  return changedRecordsCount + deletedRecordsCount;
};

export const countOutgoingChanges = async (
  models: DatabaseModel[],
  tombstoneModel: DatabaseModel,
  localSystemFact: LocalSystemFactModel,
) => {
  assertModelsForPull(models);

  const pushSince = (await localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PUSH)) || -1;
  const changeCounts = await Promise.all(
    models.map(model => countChangesForModel(model, tombstoneModel, pushSince)),
  );
  return changeCounts.reduce((total, count) => total + count, 0);
};
