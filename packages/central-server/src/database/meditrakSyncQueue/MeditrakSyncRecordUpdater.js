import { getSyncQueueChangeTime } from '@tupaia/tsutils';

// TODO: Tidy this up as part of RN-502

const arraysAreSame = (arr1, arr2) =>
  arr1.length === arr2.length && arr1.every(item => arr2.includes(item));

export class MeditrakSyncRecordUpdater {
  constructor(models) {
    this.models = models;
    this.changeIndex = 0;
  }

  /**
   * @public
   */
  async updateSyncRecords(changes) {
    this.changeIndex = 0;
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      await this.processChange(change);
    }
  }

  /**
   * @private
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

    const addedChanges = [];
    for (let i = 0; i < allChanges.length; i++) {
      const change = allChanges[i];
      addedChanges.push(await this.addToSyncQueue(change));
    }
    return addedChanges;
  }

  /**
   * @private
   */
  processChange(change) {
    if (change.record_type === 'survey') {
      return this.processSurveyChange(change);
    }

    return this.addToSyncQueue(change);
  }

  /**
   * @private
   */
  addToSyncQueue(change) {
    return this.models.meditrakSyncQueue.updateOrCreate(
      {
        record_id: change.record_id,
      },
      {
        ...change,
        change_time: getSyncQueueChangeTime(this.changeIndex++),
      },
    );
  }
}
