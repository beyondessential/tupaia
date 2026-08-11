import { uniq } from 'es-toolkit';
import { get } from 'es-toolkit/compat';

import { RECORDS } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';
import { ChangeDetailGenerator } from '../externalApiSync';

// Store certain details for faster sync processing
export class DhisChangeDetailGenerator extends ChangeDetailGenerator {
  async generateEntityDetails(entities) {
    if (entities.length === 0) return {};
    const changeDetailsById = {};
    entities.forEach(entity => {
      const isDataRegional = get(entity, 'metadata.dhis.isDataRegional', true);
      changeDetailsById[entity.id] = { isDataRegional, organisationUnitCode: entity.country_code };
    });
    return changeDetailsById;
  }

  async generateAnswerDetails(answers) {
    if (answers.length === 0) return {};
    const surveyResponseIds = uniq(answers.map(a => a.survey_response_id));
    const surveyResponses = await this.models.surveyResponse.find({ id: surveyResponseIds });
    const surveyResponseDetailsById = await this.generateSurveyResponseDetails(surveyResponses);
    const changeDetailsById = {};
    answers.forEach(answer => {
      changeDetailsById[answer.id] = surveyResponseDetailsById[answer.survey_response_id];
    });
    return changeDetailsById;
  }

  async generateSurveyResponseDetails(surveyResponses) {
    if (surveyResponses.length === 0) return {};
    const isDataRegionalBySurveyId = await this.getIsDataRegionalBySurveyId(surveyResponses);
    const entityIds = uniq(surveyResponses.map(r => r.entity_id));
    const entities = await this.models.entity.find({ id: entityIds });
    const orgUnitByEntityId = {};
    await Promise.all(
      entities.map(async entity => {
        orgUnitByEntityId[entity.id] = await entity.fetchNearestOrgUnitAncestor();
      }),
    );
    const changeDetailsById = {};
    surveyResponses.forEach(surveyResponse => {
      // Check whether to use the regional or a country specific dhis2 instance
      const isDataRegional = isDataRegionalBySurveyId[surveyResponse.survey_id];

      // Get the organisation unit code
      const { code: organisationUnitCode } = orgUnitByEntityId[surveyResponse.entity_id];

      changeDetailsById[surveyResponse.id] = { isDataRegional, organisationUnitCode };
    });
    return changeDetailsById;
  }

  getIsDataRegionalBySurveyId = async surveyResponses => {
    const surveyIds = uniq(surveyResponses.map(r => r.survey_id));
    const surveyData = await this.models.database.find(
      RECORDS.SURVEY,
      { [`${RECORDS.SURVEY}.id`]: surveyIds },
      {
        joinWith: RECORDS.DATA_GROUP,
        joinCondition: [`${RECORDS.DATA_GROUP}.id`, `${RECORDS.SURVEY}.data_group_id`],
        columns: [`${RECORDS.SURVEY}.id`, `${RECORDS.DATA_GROUP}.config`],
      },
    );

    return reduceToDictionary(surveyData, 'id', ({ config }) => {
      // TODO: migrate dhis sync to use new dhisInstanceCode instead of legacy config
      return config.dhisInstanceCode === 'regional';
    });
  };

  generateDetails = async updateChanges => {
    // entities
    const entityDetailsById = await this.generateEntityDetails(
      this.getRecordsFromChangesForModel(updateChanges, this.models.entity),
    );

    // answers
    const answerDetailsById = await this.generateAnswerDetails(
      this.getRecordsFromChangesForModel(updateChanges, this.models.answer),
    );

    // survey responses
    const surveyResponseDetailsById = await this.generateSurveyResponseDetails(
      this.getRecordsFromChangesForModel(updateChanges, this.models.surveyResponse),
    );

    const detailsByChangeId = {
      ...entityDetailsById,
      ...answerDetailsById,
      ...surveyResponseDetailsById,
    };

    return updateChanges.map(c => JSON.stringify(detailsByChangeId[c.record_id]));
  };
}
