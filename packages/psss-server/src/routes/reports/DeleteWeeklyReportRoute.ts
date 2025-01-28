import { Request } from 'express';
import { WEEKLY_SURVEY_COUNTRY, WEEKLY_SURVEY_SITE } from '../../constants';
import { Route } from '../Route';

export type DeleteWeeklyReportRequest = Request<
  { countryCode: string; siteCode: string },
  any,
  Record<string, unknown>,
  { week: string }
>;

export class DeleteWeeklyReportRoute extends Route<DeleteWeeklyReportRequest> {
  public async buildResponse() {
    const { week } = this.req.query;
    const { countryCode, siteCode } = this.req.params;

    const isSiteSurvey = !!siteCode;
    const existingSurveyResponse = await this.centralConnection.findSurveyResponse(
      isSiteSurvey ? WEEKLY_SURVEY_SITE : WEEKLY_SURVEY_COUNTRY,
      isSiteSurvey ? siteCode : countryCode,
      week,
    );

    if (existingSurveyResponse) {
      return this.centralConnection.deleteSurveyResponse(existingSurveyResponse.id);
    }

    return 'No existing survey response';
  }
}
