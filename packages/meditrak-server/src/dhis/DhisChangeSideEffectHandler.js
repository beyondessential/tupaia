/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getUniqueEntries } from '@tupaia/utils';
import { ChangeSideEffectHandler } from '../externalApiSync';

export class DhisChangeSideEffectHandler extends ChangeSideEffectHandler {
  triggerSideEffects = async changes => {
    // If an event based answer is added, updated, or deleted, trigger an update to its parent
    // survey response, as event based answers sync to dhis2 as a whole response
    const allAnswers = this.getRecordsFromChangesForModel(changes, this.models.answer);
    const allSurveyResponseIds = getUniqueEntries(allAnswers.map(a => a.survey_response_id));
    const responsesToMarkAsChangedById = {};
    const batchSize = this.models.database.maxBindingsPerQuery;
    for (let i = 0; i < allSurveyResponseIds.length; i += batchSize) {
      const batchOfSurveyResponseIds = allSurveyResponseIds.slice(i, i + batchSize);
      const batchOfResponses = await this.models.database.executeSql(
        `
          SELECT DISTINCT survey_response.*
          FROM survey_response
          JOIN survey ON survey_response.survey_id = survey.id
          JOIN entity ON survey_response.entity_id = entity.id
          WHERE survey_response.id IN (${batchOfSurveyResponseIds.map(() => '?').join(',')})
          AND ${this.models.surveyResponse.getOnlyEventsQueryClause()};
        `,
        batchOfSurveyResponseIds,
      );
      batchOfResponses.forEach(r => {
        responsesToMarkAsChangedById[r.id] = r;
      });
    }
    const responsesToMarkAsChanged = Object.values(responsesToMarkAsChangedById);
    await this.models.surveyResponse.markRecordsAsChanged(responsesToMarkAsChanged);
  };
}
