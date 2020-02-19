/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ChangeValidator } from '../externalApiSync';

export class Ms1ChangeValidator extends ChangeValidator {
  getValidDeletes = async changes => {
    return this.getPreviouslySyncedDeletes(changes, this.models.ms1SyncQueue);
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
