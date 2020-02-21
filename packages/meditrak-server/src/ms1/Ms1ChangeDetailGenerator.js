/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ChangeDetailGenerator } from '../externalApiSync';

export class Ms1ChangeDetailGenerator extends ChangeDetailGenerator {
  generateDetails = async updateChanges => {
    const surveyResponses = await this.models.surveyResponse.findManyById(
      this.getRecordIds(updateChanges),
    );

    const surveyIds = this.getUniqueEntries(surveyResponses.map(r => r.survey_id));
    const surveys = await this.models.survey.findManyById(surveyIds);
    const surveyCodeById = {};
    surveys.forEach(s => {
      surveyCodeById[s.id] = s.code;
    });

    const entityIds = this.getUniqueEntries(surveyResponses.map(r => r.entity_id));
    const entities = await this.models.entity.find({ id: entityIds });
    const orgUnitCodeByEntityId = {};
    entities.forEach(entity => {
      orgUnitCodeByEntityId[entity.id] = entity.code;
    });
    const changeDetailsById = {};
    surveyResponses.forEach(surveyResponse => {
      changeDetailsById[surveyResponse.id] = {
        surveyCode: surveyCodeById[surveyResponse.survey_id],
        organisationUnitCode: orgUnitCodeByEntityId[surveyResponse.entity_id],
      };
    });
    return updateChanges.map(c => JSON.stringify(changeDetailsById[c.record_id]));
  };
}
