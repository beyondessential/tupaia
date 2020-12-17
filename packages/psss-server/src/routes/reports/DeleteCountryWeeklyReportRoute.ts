/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';

const SURVEY_CODE = 'PSSS_WNR';

export class DeleteCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { week } = this.req.query;
    const { organisationUnitCode } = this.req.params;

    const existingSurveyResponse = await this.meditrakConnection?.findSurveyResponse(
      SURVEY_CODE,
      organisationUnitCode,
      week,
    );

    if (existingSurveyResponse) {
      return this.meditrakConnection?.deleteSurveyResponse(existingSurveyResponse);
    }

    return 'No existing survey response';
  }
}
