/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ChangeValidator } from '../externalApiSync';

export class Ms1ChangeValidator extends ChangeValidator {
  getValidDeletes = async changes => {
    return this.getPreviouslySyncedDeletes(changes, this.models.ms1SyncQueue);
  };

  fetchDemoLandEntityIds = async () => {
    if (!this.demolandEntityIds) {
      const demolandEntities = await this.models.entity.find({ country_code: 'DL' });
      this.demolandEntityIds = demolandEntities.map(({ id }) => id);
    }
    return this.demolandEntityIds;
  };

  fetchMs1SurveyIds = async () => {
    if (!this.ms1SurveyIds) {
      const ms1Surveys = await this.models.database.executeSql(`
        SELECT id
        FROM survey
        WHERE integration_metadata->'ms1' ? 'endpoint';
      `);
      this.ms1SurveyIds = ms1Surveys.map(({ id }) => id);
    }
    return this.ms1SurveyIds;
  };

  getValidUpdates = async changes => {
    const validations = await Promise.all(
      changes.map(async change => {
        const surveyResponse = await this.models.surveyResponse.findOne({ id: change.record_id });
        if (!surveyResponse) return false;

        // ditch if demoland
        const demolandEntityIds = await this.fetchDemoLandEntityIds();
        if (demolandEntityIds.includes(surveyResponse.entity_id)) return false;

        // only include responses for ms1 surveys
        const ms1SurveyIds = await this.fetchMs1SurveyIds();
        if (!ms1SurveyIds.includes(surveyResponse.survey_id)) return false;

        return true;
      }),
    );
    return changes.filter((_, i) => validations[i]);
  };
}
