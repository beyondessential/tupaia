import type { ModelRegistry } from '@tupaia/database';
import { FilteredModelRegistry, SyncDirectionValues, SyncSessionDirectionValues } from '../types';
import { SyncDirections } from '@tupaia/constants';

export const getModelsForDirection = <T extends ModelRegistry>(
  models: T,
  direction: SyncSessionDirectionValues,
): FilteredModelRegistry => {
  const filter = (modelSyncDirection: SyncDirectionValues) => {
    if (direction === SyncDirections.DO_NOT_SYNC) {
      return modelSyncDirection === SyncDirections.DO_NOT_SYNC;
    }
    // other sync directions include bidirectional models
    return [direction, SyncDirections.BIDIRECTIONAL].includes(modelSyncDirection);
  };

  return Object.fromEntries(
    Object.entries(models).filter(([, model]) => filter(model.syncDirection)),
  ) as FilteredModelRegistry;
};
