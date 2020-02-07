/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { ENTITY_TYPES } from '../database/models/Entity';

const UPDATE = 'update';
const DELETE = 'delete';

const getHash = (recordId, type) => `${recordId}: ${type}`;
const getHashForChange = ({ record_id: recordId, type }) => getHash(recordId, type);
const getRecordIds = changes => changes.map(c => c.record_id);
const getChangesOfType = (changes, type) => changes.filter(c => c.type === type);
const getChangesForRecordType = (changes, recordType) =>
  changes.filter(c => c.record_type === recordType);
const getUniqueEntries = entries => Array.from(new Set(entries));

export class ChangeValidator {
  constructor(models) {
    this.models = models;
  }

  getValidDeletes = async changes => {
    // If there is a sync log or queue record with this record_id, the delete record must be
    // valid for the dhis sync queue
    const deleteChanges = getChangesOfType(changes, DELETE);
    const recordIds = getRecordIds(deleteChanges);
    const syncLogRecords = await this.models.dhisSyncLog.find({ record_id: recordIds });
    const syncQueueRecords = await this.models.dhisSyncQueue.find({ record_id: recordIds });
    const validDeletes = getUniqueEntries([
      ...syncLogRecords.map(r => r.record_id),
      ...syncQueueRecords.map(r => r.record_id),
    ]);
    return validDeletes;
  };

  getValidEntityUpdates = async entityIds => entityIds; // all entity updates are valid

  getValidAnswerUpdates = async answerIds => {
    const answers = await this.models.answer.find({
      id: answerIds,
    });
    const surveyResponseIds = getUniqueEntries(answers.map(a => a.survey_response_id));
    const surveyResponses = await this.models.surveyResponse.find({
      id: surveyResponseIds,
    });

    // event based answer changes are synced via the survey response, remove those response ids
    const nonEventBasedSurveyResponseIds = (
      await Promise.all(
        surveyResponses.map(async surveyResponse => {
          const isEventBased = await surveyResponse.isEventBased();
          return isEventBased ? null : surveyResponse.id;
        }),
      )
    ).filter(r => !!r);

    // of the remaining responses, check which are valid
    const validSurveyResponseIds = new Set(
      await this.getValidSurveyResponseUpdates(nonEventBasedSurveyResponseIds),
    );

    // return the answers that are part of a valid survey response
    return answers.filter(a => validSurveyResponseIds.has(a.survey_response_id)).map(a => a.id);
  };

  getValidSurveyResponseUpdates = async surveyResponseIds => {
    const surveyResponses = await this.models.surveyResponse.find({ id: surveyResponseIds });
    const surveyIds = getUniqueEntries(surveyResponses.map(r => r.survey_id));
    const surveys = await this.models.survey.find({ id: surveyIds });
    const surveyIdsForDhis2 = new Set(
      surveys.filter(s => !!s.integration_metadata.dhis2).map(s => s.id),
    );
    const surveyResponsesForDhis2 = surveyResponses.filter(r => surveyIdsForDhis2.has(r.survey_id));

    const validSurveyResponseIds = [];
    await Promise.all(
      surveyResponsesForDhis2.map(async surveyResponse => {
        // If the survey is logging data against world we don't need to check demo land
        const surveyEntity = await surveyResponse.entity();
        if (surveyEntity.type === ENTITY_TYPES.WORLD) {
          validSurveyResponseIds.push(surveyResponse.id);
          return;
        }
        const { id: countryId } = await surveyEntity.country();

        const demoLand = await this.models.country.findOne({ name: 'Demo Land' });
        const publicPermissionGroup = await this.models.permissionGroup.findOne({ name: 'Public' });
        const userCountryPermission = await this.models.userCountryPermission.findOne({
          user_id: surveyResponse.user_id,
          country_id: countryId,
          permission_group_id: publicPermissionGroup.id,
        });
        // ignore public demoland responses
        if (countryId === demoLand.id && userCountryPermission) return;
        validSurveyResponseIds.push(surveyResponse.id);
      }),
    );
    return validSurveyResponseIds;
  };

  getValidUpdates = async changes => {
    const updateChanges = getChangesOfType(changes, UPDATE);
    const getValidIdsForModel = (validator, model) =>
      validator(getRecordIds(getChangesForRecordType(updateChanges, model.databaseType)));
    const validEntities = await getValidIdsForModel(this.getValidEntityUpdates, this.models.entity);
    const validAnswers = await getValidIdsForModel(this.getValidAnswerUpdates, this.models.answer);
    const validSurveyResponses = await getValidIdsForModel(
      this.getValidSurveyResponseUpdates,
      this.models.surveyResponse,
    );
    return [...validEntities, ...validAnswers, ...validSurveyResponses];
  };

  validate = async changes => {
    const validDeletes = await this.getValidDeletes(changes);
    const validUpdates = await this.getValidUpdates(changes);
    const validChangeHashes = new Set([
      ...validDeletes.map(id => getHash(id, DELETE)),
      ...validUpdates.map(id => getHash(id, UPDATE)),
    ]);
    return changes.map(c => validChangeHashes.has(getHashForChange(c)));
  };
}
