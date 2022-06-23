/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { ChangeHandler } from '@tupaia/database';
import { createPermissionsBasedMeditrakSyncQueue } from './createPermissionsBasedMeditrakSyncQueue';

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

const arraysAreSame = (arr1, arr2) =>
  arr1.length === arr2.length && arr1.every(item => arr2.includes(item));

/**
 * Adds server side changes to the meditrakSyncQueue
 */
export class MeditrakSyncQueue extends ChangeHandler {
  constructor(models) {
    super(models);
    this.syncQueueModel = models.meditrakSyncQueue;

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

  async createPermissionsBasedView() {
    await createPermissionsBasedMeditrakSyncQueue(this.models.database);
    winston.info(`Created permissions_based_meditrak_sync_queue`);
  }

  async refreshPermissionsBasedView() {
    try {
      const start = Date.now();
      await this.models.database.executeSql(
        `REFRESH MATERIALIZED VIEW CONCURRENTLY permissions_based_meditrak_sync_queue;`,
      );
      const end = Date.now();
      winston.info(`permissions_based_meditrak_sync_queue refresh took: ${end - start}ms`);
    } catch (error) {
      winston.error(`permissions_based_meditrak_sync_queue refresh failed: ${error.message}`);
    }
  }

  /**
   * We need to check for permissions changes when processing survey changes
   * If the permissions have changed, we need to update all related records
   */
  async processSurveyChange(surveyChangeData) {
    const { new_record: newRecord, old_record: oldRecord, ...surveyChange } = surveyChangeData;
    if (!oldRecord) {
      // New survey, so permissions cannot have changed
      return this.addToSyncQueue(surveyChange);
    }

    if (!newRecord) {
      // survey is deleted, no need to bother about permissions associated with it
      return this.addToSyncQueue(surveyChange);
    }

    if (
      newRecord.permission_group_id === oldRecord.permission_group_id &&
      arraysAreSame(newRecord.country_ids, oldRecord.country_ids)
    ) {
      // Permissions haven't changed, just queue the survey change
      return this.addToSyncQueue(surveyChange);
    }

    // Permissions have changed, enqueue changes for all related records
    // to ensure devices sync down those records if they now have permissions
    const survey = await this.models.survey.findById(surveyChange.record_id);
    const surveyScreenChanges = (await survey.surveyScreens()).map(record => ({
      record_type: 'survey_screen',
      record_id: record.id,
      type: 'update',
    }));
    const surveyScreenComponentChanges = (await survey.surveyScreenComponents()).map(record => ({
      record_type: 'survey_screen_component',
      record_id: record.id,
      type: 'update',
    }));
    const questionChanges = (await survey.questions()).map(record => ({
      record_type: 'question',
      record_id: record.id,
      type: 'update',
    }));
    const optionSetChanges = (await survey.optionSets()).map(record => ({
      record_type: 'option_set',
      record_id: record.id,
      type: 'update',
    }));
    const optionChanges = (await survey.options()).map(record => ({
      record_type: 'option',
      record_id: record.id,
      type: 'update',
    }));

    const allChanges = [
      surveyChange,
      ...surveyScreenChanges,
      ...surveyScreenComponentChanges,
      ...questionChanges,
      ...optionSetChanges,
      ...optionChanges,
    ];

    return Promise.all(allChanges.map(change => this.addToSyncQueue(change)));
  }

  processChange(change) {
    if (change.record_type === 'survey') {
      return this.processSurveyChange(change);
    }

    return this.addToSyncQueue(change);
  }

  addToSyncQueue(change) {
    return this.syncQueueModel.updateOrCreate(
      {
        record_id: change.record_id,
      },
      {
        ...change,
        change_time: Math.random(), // Force an update, after which point the trigger will update the change_time to more complicated now() + sequence
      },
    );
  }

  async handleChanges(changes) {
    await Promise.all(changes.map(change => this.processChange(change)));
    await this.refreshPermissionsBasedView();
  }
}
