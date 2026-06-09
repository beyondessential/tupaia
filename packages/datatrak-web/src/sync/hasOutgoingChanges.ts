import { SyncFact } from '@tupaia/constants';
import { DatabaseModel, LocalSystemFactModel } from '@tupaia/database';
import { assertModelsForPush } from './assertModelsForPush';
import { getModelOutgoingChangesFilter } from './getModelOutgoingChangesFilter';

const hasChangesForModel = async (model: DatabaseModel, since: number) => {
  const filter = getModelOutgoingChangesFilter(since);
  return await model.exists(filter);
};

export const hasOutgoingChanges = async (
  models: DatabaseModel[],
  localSystemFact: LocalSystemFactModel,
): Promise<boolean> => {
  assertModelsForPush(models);

  const lastSuccessfulSyncPush =
    (await localSystemFact.get(SyncFact.LAST_SUCCESSFUL_SYNC_PUSH)) ?? '-1';
  const pushSince = Number.parseInt(lastSuccessfulSyncPush, 10);
  const results = await Promise.all(models.map(model => hasChangesForModel(model, pushSince)));
  return results.some(Boolean);
};
