/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { get } from 'lodash';
import { ChangeDetailGenerator } from '../externalApiSync';

// Store certain details for faster sync processing
export class DhisChangeDetailGenerator extends ChangeDetailGenerator {
  async generateEntityDetails(entityIds) {
    const entities = await this.models.entity.find({ id: entityIds });
    const changeDetailsById = {};
    entities.forEach(entity => {
      const isDataRegional = get(entity, 'metadata.dhis.isDataRegional', true);
      changeDetailsById[entity.id] = { isDataRegional, organisationUnitCode: entity.country_code };
    });
    return changeDetailsById;
  }

  async generateAnswerDetails(answerIds) {
    const answers = await this.models.answer.findManyById(answerIds);
    const surveyResponseIds = this.getUniqueEntries(answers.map(a => a.survey_response_id));
    const surveyResponseDetailsById = await this.generateSurveyResponseDetails(surveyResponseIds);
    const changeDetailsById = {};
    answers.forEach(answer => {
      changeDetailsById[answer.id] = surveyResponseDetailsById[answer.survey_response_id];
    });
    return changeDetailsById;
  }

  async generateSurveyResponseDetails(surveyResponseIds) {
    const surveyResponses = await this.models.surveyResponse.find({ id: surveyResponseIds });
    const surveyIds = this.getUniqueEntries(surveyResponses.map(r => r.survey_id));
    const surveys = await this.models.survey.find({ id: surveyIds });
    const isDataRegionalBySurveyId = {};
    surveys.forEach(s => {
      isDataRegionalBySurveyId[s.id] = s.getIsDataForRegionalDhis2();
    });

    const entityIds = this.getUniqueEntries(surveyResponses.map(r => r.entity_id));
    const entities = await this.models.entity.find({ id: entityIds });
    const orgUnitByEntityId = {};
    await Promise.all(
      entities.map(async entity => {
        orgUnitByEntityId[entity.id] = await entity.fetchClosestOrganisationUnit();
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

  generateDetails = async updateChanges => {
    // entities
    const entityDetailsById = await this.generateEntityDetails(
      this.getIdsFromChangesForModel(updateChanges, this.models.entity),
    );

    // answers
    const answerDetailsById = await this.generateAnswerDetails(
      this.getIdsFromChangesForModel(updateChanges, this.models.answer),
    );

    // survey responses
    const surveyResponseDetailsById = await this.generateSurveyResponseDetails(
      this.getIdsFromChangesForModel(updateChanges, this.models.surveyResponse),
    );

    const detailsByChangeId = {
      ...entityDetailsById,
      ...answerDetailsById,
      ...surveyResponseDetailsById,
    };

    return updateChanges.map(c => JSON.stringify(detailsByChangeId[c.record_id]));
  };
}
