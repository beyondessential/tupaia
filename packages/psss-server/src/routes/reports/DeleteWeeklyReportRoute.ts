/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { WEEKLY_SURVEY_COUNTRY, WEEKLY_SURVEY_SITE } from '../../constants';
import { Route } from '../Route';
import { UnauthenticatedError } from '@tupaia/utils';

export class DeleteWeeklyReportRoute extends Route {
  async buildResponse() {
    if (!this.meditrakConnection) throw new UnauthenticatedError('Unauthenticated');

    const { week } = this.req.query;
    const { countryCode, siteCode } = this.req.params;

    const isSiteSurvey = !!siteCode;
    const existingSurveyResponse = await this.meditrakConnection.findSurveyResponse(
      isSiteSurvey ? WEEKLY_SURVEY_SITE : WEEKLY_SURVEY_COUNTRY,
      isSiteSurvey ? siteCode : countryCode,
      week,
    );

    if (existingSurveyResponse) {
      return this.meditrakConnection.deleteSurveyResponse(existingSurveyResponse.id);
    }

    return 'No existing survey response';
  }
}
