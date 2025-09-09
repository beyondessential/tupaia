import { DatabaseModel } from '@tupaia/database';
import { SyncDirections } from '@tupaia/constants';

export const assertModelsForPull = (models: DatabaseModel[]) => {
  const invalidModelNames = Object.values(models)
    .filter(
      m =>
        ![SyncDirections.BIDIRECTIONAL, SyncDirections.PUSH_TO_CENTRAL].includes(
          (m.constructor as typeof DatabaseModel).syncDirection,
        ),
    )
    .map(m => m.databaseRecord);

  if (invalidModelNames.length) {
    throw new Error(
      `Invalid sync direction(s) when pushing these models from client: ${invalidModelNames}`,
    );
  }
};
