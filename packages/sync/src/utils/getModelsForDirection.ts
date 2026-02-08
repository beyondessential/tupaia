import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '@tupaia/database';

export const getModelsForDirections = (
  models: DatabaseModel[],
  directions: SyncDirections[],
): DatabaseModel[] => {
  return models.filter(model =>
    directions.includes((model.constructor as typeof DatabaseModel).syncDirection),
  );
};

export const getModelsForPull = (models: DatabaseModel[]) =>
  getModelsForDirections(models, [SyncDirections.PULL_FROM_CENTRAL, SyncDirections.BIDIRECTIONAL]);

export const getModelsForPush = (models: DatabaseModel[]) =>
  getModelsForDirections(models, [SyncDirections.PUSH_TO_CENTRAL, SyncDirections.BIDIRECTIONAL]);
