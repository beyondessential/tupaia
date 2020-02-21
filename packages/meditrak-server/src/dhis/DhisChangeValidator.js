/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { ChangeValidator } from '../externalApiSync';

export class DhisChangeValidator extends ChangeValidator {
  queryValidSurveyResponseIds = async (surveyResponseIds, excludeEventBased = false) => {
    const nonPublicDemoLandUsers = (
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
    ).map(r => r.user_id);
    const validSurveyResponseIds = [];
    const batchSize = this.models.database.maxBindingsPerQuery - nonPublicDemoLandUsers.length;
    for (let i = 0; i < surveyResponseIds.length; i += batchSize) {
      const batchOfSurveyResponseIds = surveyResponseIds.slice(i, i + batchSize);
      const batchOfSurveyResponses = await this.models.database.executeSql(
        `
          SELECT DISTINCT survey_response.id as id
          FROM survey_response
          JOIN survey ON survey_response.survey_id = survey.id
          JOIN entity ON survey_response.entity_id = entity.id
          WHERE survey.integration_metadata \\? 'dhis2'
          AND (
            entity.country_code <> 'DL'
            OR survey_response.user_id IN (${nonPublicDemoLandUsers.map(() => '?').join(',')})
          )
          ${
            excludeEventBased
              ? `AND ${this.models.surveyResponse.getExcludeEventsQueryClause()}`
              : ''
          }
          AND survey_response.id IN (${batchOfSurveyResponseIds.map(() => '?').join(',')});
        `,
        [...nonPublicDemoLandUsers, ...batchOfSurveyResponseIds],
      );
      validSurveyResponseIds.push(...batchOfSurveyResponses.map(r => r.id));
    }
    return validSurveyResponseIds;
  };

  getValidDeletes = async changes => {
    return this.getPreviouslySyncedDeletes(
      changes,
      this.models.dhisSyncQueue,
      this.models.dhisSyncLog,
    );
  };

  getValidAnswerUpdates = async answerIds => {
    if (answerIds.length === 0) return [];
    // can be a lot, so batch the finding of answers
    const answers = await this.models.answer.findManyById(answerIds);
    const surveyResponseIds = this.getUniqueEntries(answers.map(a => a.survey_response_id));

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
    const updateChanges = this.getUpdateChanges(changes);
    const validEntities = this.getIdsFromChangesForModel(updateChanges, this.models.entity); // all entity updates are valid
    const validAnswers = await this.getValidAnswerUpdates(
      this.getIdsFromChangesForModel(updateChanges, this.models.answer),
    );
    const validSurveyResponses = await this.getValidSurveyResponseUpdates(
      this.getIdsFromChangesForModel(updateChanges, this.models.surveyResponse),
    );
    return this.filterChangesWithMatchingIds(changes, [
      ...validEntities,
      ...validAnswers,
      ...validSurveyResponses,
    ]);
  };
}
