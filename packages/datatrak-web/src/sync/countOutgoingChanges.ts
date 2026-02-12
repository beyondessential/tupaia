import { DatabaseModel, LocalSystemFactModel } from '@tupaia/database';
import { SyncFact } from '@tupaia/constants';
import { isNullish } from '@tupaia/tsutils';

import { assertModelsForPush } from './assertModelsForPush';
import { getModelOutgoingChangesFilter } from './getModelOutgoingChangesFilter';

const countChangesForModel = async (model: DatabaseModel, since: number) => {
  const countFilter = getModelOutgoingChangesFilter(since);
  console.log('model', model);
  return await model.count(countFilter);
};

export const countOutgoingChanges = async (
  models: DatabaseModel[],
  localSystemFact: LocalSystemFactModel,
) => {
  assertModelsForPush(models);

  const lastSuccessfulSyncPush = await localSystemFact.get(SyncFact.LAST_SUCCESSFUL_SYNC_PUSH);
  const pushSince = isNullish(lastSuccessfulSyncPush) ? -1 : parseInt(lastSuccessfulSyncPush, 10);
  console.log('models', models);
  const changeCounts = await Promise.all(
    models.map(model => countChangesForModel(model, pushSince)),
  );
  return changeCounts.reduce((total, count) => total + count, 0);
};
