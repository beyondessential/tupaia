import { Request } from 'express';
import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';

import { WEEKLY_SURVEY_COUNTRY, WEEKLY_SURVEY_SITE } from '../../constants';
import { validateIsNumber } from '../../utils';

export type SaveWeeklyReportRequest = Request<
  { countryCode: string; siteCode: string },
  any,
  Record<string, unknown>,
  { week: string }
>;

export class SaveWeeklyReportRoute extends Route<SaveWeeklyReportRequest> {
  public async buildResponse() {
    const { week } = this.req.query;
    const { countryCode, siteCode } = this.req.params;

    const isSiteSurvey = !!siteCode;
    const answers = mapReqBodyToAnswers(this.req.body, isSiteSurvey);

    return this.centralConnection.updateOrCreateSurveyResponse(
      isSiteSurvey ? WEEKLY_SURVEY_SITE : WEEKLY_SURVEY_COUNTRY,
      isSiteSurvey ? siteCode : countryCode,
      week,
      answers,
    );
  }
}

const mapReqBodyToAnswers = (body: Record<string, unknown>, isSiteSurvey: boolean) => {
  const { sites, sitesReported, afr, dia, ili, pf, dli } = body;

  const errorHandler = (field: string) => (value: unknown) =>
    new RespondingError(
      `Cannot save weekly data: Invalid value for '${field}' - ${value} is not a number`,
      500,
    );

  const answers = [
    {
      code: 'PSSS_AFR_Cases',
      value: validateIsNumber(afr, errorHandler('afr')),
    },
    {
      code: 'PSSS_DIA_Cases',
      value: validateIsNumber(dia, errorHandler('dia')),
    },
    {
      code: 'PSSS_ILI_Cases',
      value: validateIsNumber(ili, errorHandler('ili')),
    },
    {
      code: 'PSSS_PF_Cases',
      value: validateIsNumber(pf, errorHandler('pf')),
    },
    {
      code: 'PSSS_DLI_Cases',
      value: validateIsNumber(dli, errorHandler('dli')),
    },
  ];

  if (!isSiteSurvey) {
    answers.push({
      code: 'PSSS_Sites',
      value: validateIsNumber(sites, errorHandler('sites')),
    });
    answers.push({
      code: 'PSSS_Sites_Reported',
      value: validateIsNumber(sitesReported, errorHandler('sitesReported')),
    });
  }

  return answers;
};
