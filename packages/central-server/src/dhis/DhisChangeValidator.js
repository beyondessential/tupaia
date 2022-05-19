/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getUniqueEntries } from '@tupaia/utils';
import { ChangeValidator } from '../externalApiSync';

export class DhisChangeValidator extends ChangeValidator {
  queryValidSurveyResponseIds = async (surveyResponseIds, excludeEventBased = false) => {
    const nonPublicDemoLandUsers = (
      await this.models.database.executeSql(
        `
          SELECT DISTINCT user_id
          FROM user_entity_permission
          JOIN entity ON entity.id = user_entity_permission.entity_id
          JOIN permission_group ON permission_group.id = user_entity_permission.permission_group_id
          WHERE entity.code = 'DL'
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
          JOIN data_group ON data_group.id = survey.data_group_id
          JOIN entity ON survey_response.entity_id = entity.id
          AND data_group.service_type = 'dhis'
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

  getValidAnswerUpdates = async updateChanges => {
    const answers = this.getRecordsFromChangesForModel(updateChanges, this.models.answer);
    if (answers.length === 0) return [];
    const surveyResponseIds = getUniqueEntries(answers.map(a => a.survey_response_id));

    // check which survey responses are valid
    const validSurveyResponseIds = new Set(
      await this.queryValidSurveyResponseIds(surveyResponseIds, true),
    );

    // filter out answers for questions that do not sync to dhis
    const dhisLinkedAnswers = await this.filterDhisLinkedAnswers(answers);

    // return the answers that are part of a valid survey response
    return dhisLinkedAnswers
      .filter(a => validSurveyResponseIds.has(a.survey_response_id))
      .map(a => a.id);
  };

  /**
   * Returns the set of answers that are linked via a data element to the dhis service type
   * @param answers Answer[]
   * @returns {Promise<Answer[]>}
   * @private
   */
  filterDhisLinkedAnswers = async answers => {
    const filteredAnswers = [];

    for (const answer of answers) {
      const question = await this.models.question.findById(answer.question_id);
      const dataElement = await question.dataElement();
      if (!dataElement) {
        throw new Error(`Could not find a data element for question ${question.code}`);
      }

      if (dataElement.service_type === 'dhis') {
        filteredAnswers.push(answer);
      }
    }

    return filteredAnswers;
  };

  getValidSurveyResponseUpdates = async updateChanges => {
    const surveyResponseIds = this.getIdsFromChangesForModel(
      updateChanges,
      this.models.surveyResponse,
    );
    if (surveyResponseIds.length === 0) return [];
    return this.queryValidSurveyResponseIds(surveyResponseIds);
  };

  getValidEntityUpdates = async updateChanges => {
    const entityIds = this.getIdsFromChangesForModel(updateChanges, this.models.entity);
    if (entityIds.length === 0) return [];

    const entities = await this.models.entity.findManyById(entityIds);
    return entities.filter(e => e.allowsPushingToDhis()).map(e => e.id);
  };

  getValidUpdates = async changes => {
    const updateChanges = this.getUpdateChanges(changes);
    const validEntityIds = await this.getValidEntityUpdates(updateChanges);
    const validAnswerIds = await this.getValidAnswerUpdates(updateChanges);
    const validSurveyResponseIds = await this.getValidSurveyResponseUpdates(updateChanges);
    return this.filterChangesWithMatchingIds(changes, [
      ...validEntityIds,
      ...validAnswerIds,
      ...validSurveyResponseIds,
    ]);
  };
}
