/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
const UPDATE = 'update';
const DELETE = 'delete';

const getRecordIds = changes => changes.map(c => c.record_id);
const getChangesOfType = (changes, type) => changes.filter(c => c.type === type);
const getChangesForRecordType = (changes, recordType) =>
  changes.filter(c => c.record_type === recordType);
const getUniqueEntries = entries => Array.from(new Set(entries));

export class ChangeValidator {
  constructor(models) {
    this.models = models;
  }

  queryValidSurveyResponseIds = async (surveyResponseIds, excludeEventBased = false) => {
    const nonPublicDemoLandUsers = [
      (
        await this.models.database.executeSql(
          `
          SELECT DISTINCT user_id
          FROM user_country_permission
          JOIN country ON country.id = user_country_permission.country_id
          JOIN permission_group ON permission_group.id = user_country_permission.permission_group_id
          WHERE country.code = 'DL'
          AND permission_group.name <> 'Public';
        `,
        )
      ).map(r => r.user_id)[0],
    ];
    const results = await this.models.database.executeSql(
      `
        SELECT DISTINCT survey_response.id as id
        FROM survey_response
        JOIN survey ON survey_response.survey_id = survey.id
        JOIN entity ON survey_response.entity_id = entity.id
        WHERE survey.integration_metadata::text LIKE '%"dhis2":%'
        AND (
          entity.country_code <> 'DL'
          OR survey_response.user_id IN (${nonPublicDemoLandUsers.map(id => `'${id}'`).join(',')})
        )
        ${
          excludeEventBased
            ? `
              AND survey.can_repeat = FALSE
              AND entity.type IN ('facility','region','country','world','village')
              `
            : ''
        }
        AND survey_response.id IN (${surveyResponseIds.map(id => `'${id}'`).join(',')});
      `,
    );
    return results.map(r => r.id);
  };

  getValidDeletes = async changes => {
    // If there is a sync log or queue record with this record_id, the delete record must be
    // valid for the dhis sync queue
    const deleteChanges = getChangesOfType(changes, DELETE);
    const recordIds = getRecordIds(deleteChanges);
    const syncLogRecords = await this.models.dhisSyncLog.find({ record_id: recordIds });
    const syncQueueRecords = await this.models.dhisSyncQueue.find({ record_id: recordIds });
    const validDeleteIds = new Set([
      ...syncLogRecords.map(r => r.record_id),
      ...syncQueueRecords.map(r => r.record_id),
    ]);
    return changes.filter(c => validDeleteIds.has(c.record_id));
  };

  getValidAnswerUpdates = async answerIds => {
    if (answerIds.length === 0) return [];
    const answers = await this.models.answer.find({
      id: answerIds,
    });
    const surveyResponseIds = getUniqueEntries(answers.map(a => a.survey_response_id));

    // check which survey responses are valid
    const validSurveyResponseIds = new Set(
      await this.queryValidSurveyResponseIds(surveyResponseIds, true),
    );

    // return the answers that are part of a valid survey response
    return answers.filter(a => validSurveyResponseIds.has(a.survey_response_id)).map(a => a.id);
  };

  getValidSurveyResponseUpdates = async surveyResponseIds => {
    if (surveyResponseIds.length === 0) return [];
    return this.queryValidSurveyResponseIds(surveyResponseIds);
  };

  getValidUpdates = async changes => {
    const updateChanges = getChangesOfType(changes, UPDATE);
    const getIdsFromChanges = model =>
      getRecordIds(getChangesForRecordType(updateChanges, model.databaseType));
    const validEntities = getIdsFromChanges(this.models.entity); // all entity updates are valid
    const validAnswers = await this.getValidAnswerUpdates(getIdsFromChanges(this.models.answer));
    const validSurveyResponses = await this.getValidSurveyResponseUpdates(
      getIdsFromChanges(this.models.surveyResponse),
    );
    const validChangeIds = new Set([...validEntities, ...validAnswers, ...validSurveyResponses]);
    return changes.filter(c => validChangeIds.has(c.record_id));
  };
}
