import type { ModelRegistry } from '@tupaia/database';
import { SyncDirections } from '@tupaia/constants';

import { FilteredModelRegistry, SyncSessionDirectionValues } from '../types';

export const getModelsForDirections = <T extends ModelRegistry>(
  models: T,
  directions: SyncSessionDirectionValues[],
): FilteredModelRegistry => {
  return Object.fromEntries(
    Object.entries(models).filter(([, model]) => directions.includes(model.syncDirection)),
  ) as FilteredModelRegistry;
};

export const getModelsForPull = <T extends ModelRegistry>(models: T) =>
  getModelsForDirections(models, [SyncDirections.PULL_FROM_CENTRAL, SyncDirections.BIDIRECTIONAL]);

export const getModelsForPush = <T extends ModelRegistry>(models: T) =>
  getModelsForDirections(models, [SyncDirections.PUSH_TO_CENTRAL, SyncDirections.BIDIRECTIONAL]);
