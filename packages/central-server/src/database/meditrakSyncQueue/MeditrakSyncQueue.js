/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { ChangeHandler } from '@tupaia/database';
import { MeditrakSyncRecordUpdater } from './MeditrakSyncRecordUpdater';

const modelValidator = model => {
  if (!model.meditrakConfig.minAppVersion) {
    throw new Error(
      `Model for ${model.databaseType} must have a meditrakConfig.minAppVersion property`,
    );
  }
  return true;
};

const stripDataFromChange = change => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // eslint-disable-next-line camelcase
  const { old_record, new_record, ...restOfRecord } = change;
  return { ...restOfRecord };
};

/**
 * Adds server side changes to the meditrakSyncQueue
 */
export class MeditrakSyncQueue extends ChangeHandler {
  constructor(models) {
    super(models, 'meditrak-sync-queue');

    const typesToSync = models.getTypesToSyncWithMeditrak();
    const modelNamesToSync = Object.entries(models)
      .filter(([, model]) => typesToSync.includes(model.databaseType))
      .map(([modelName]) => modelName);
    const modelsToSync = typesToSync.map(type => models.getModelForDatabaseType(type));
    modelsToSync.forEach(model => modelValidator(model));
    this.changeTranslators = Object.fromEntries(
      modelNamesToSync.map(model => [model, change => [stripDataFromChange(change)]]),
    );

    // Keep all the data for surveys, as we want to check if the permissions have changed
    this.changeTranslators.survey = change => [change];
  }

  /**
   * @private
   */
  async refreshPermissionsBasedView(database) {
    try {
      const start = Date.now();
      await database.executeSql(
        `REFRESH MATERIALIZED VIEW CONCURRENTLY permissions_based_meditrak_sync_queue;`,
      );
      const end = Date.now();
      winston.info(`permissions_based_meditrak_sync_queue refresh took: ${end - start}ms`);
    } catch (error) {
      winston.error(`permissions_based_meditrak_sync_queue refresh failed: ${error.message}`);
    }
  }

  /**
   * @public
   */
  async handleChanges(transactingModels, changes) {
    const syncRecordUpdater = new MeditrakSyncRecordUpdater(transactingModels);
    await syncRecordUpdater.updateSyncRecords(changes);
    await this.refreshPermissionsBasedView(transactingModels.database);
  }
}
