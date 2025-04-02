import { ModelRegistry } from '@tupaia/database';
import { FilteredModelRegistry, SyncDirectionValues, SyncSessionDirectionValues } from '../types';
import { SYNC_DIRECTIONS } from '../constants';

export const getModelsForDirection = <T extends ModelRegistry>(
  models: T,
  direction: SyncSessionDirectionValues,
): FilteredModelRegistry => {
  const filter = (modelSyncDirection: SyncDirectionValues) => {
    if (direction === SYNC_DIRECTIONS.DO_NOT_SYNC) {
      return modelSyncDirection === SYNC_DIRECTIONS.DO_NOT_SYNC;
    }
    // other sync directions include bidirectional models
    return [direction, SYNC_DIRECTIONS.BIDIRECTIONAL].includes(modelSyncDirection);
  };

  return Object.fromEntries(
    Object.entries(models).filter(([, model]) => filter(model.syncDirection)),
  ) as FilteredModelRegistry;
};
