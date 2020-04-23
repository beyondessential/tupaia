import { SyncQueue } from './SyncQueue';

export const createMeditrakSyncQueue = models => {
  return new SyncQueue(
    models,
    models.meditrakSyncQueue,
    models.getTypesToSyncWithMeditrak(),
    modelValidator,
  );
};

const modelValidator = model => {
  if (!model.meditrakConfig.minAppVersion) {
    throw new Error(
      `Model for ${model.databaseType} must have a meditrakConfig.minAppVersion property`,
    );
  }
  return true;
};
