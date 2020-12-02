/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';

const SURVEY_CODE = 'PSSS_Confirmed_WNR';

export class UpdateConfirmedCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { week } = this.req.query;
    const { answers } = this.req.body;
    const { organisationUnitCode } = this.req.params;

    const result = await this.meditrakConnection?.findSurveyResponse(
      SURVEY_CODE,
      organisationUnitCode,
      week,
    );

    if (result) {
      return this.meditrakConnection?.updateSurveyResponse(result, answers);
    }

    return this.meditrakConnection?.createSurveyResponse(SURVEY_CODE, answers);
  }
}
