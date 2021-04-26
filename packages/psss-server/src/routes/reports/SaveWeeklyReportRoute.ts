/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';
import { WEEKLY_SURVEY_COUNTRY, WEEKLY_SURVEY_SITE } from '../../constants';
import { validateIsNumber } from '../../utils';

type WeeklyReportAnswers = {
  PSSS_AFR_Cases: number;
  PSSS_DIA_Cases: number;
  PSSS_ILI_Cases: number;
  PSSS_PF_Cases: number;
  PSSS_DLI_Cases: number;
  PSSS_Sites?: number;
  PSSS_Sites_Reported?: number;
};

export class SaveWeeklyReportRoute extends Route {
  async buildResponse() {
    const { week } = this.req.query;
    const { countryCode, siteCode } = this.req.params;

    const isSiteSurvey = !!siteCode;
    const answers = mapReqBodyToAnswers(this.req.body, isSiteSurvey);

    return this.meditrakConnection?.updateOrCreateSurveyResponse(
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

  const answers: WeeklyReportAnswers = {
    PSSS_AFR_Cases: validateIsNumber(afr, errorHandler('afr')),
    PSSS_DIA_Cases: validateIsNumber(dia, errorHandler('dia')),
    PSSS_ILI_Cases: validateIsNumber(ili, errorHandler('ili')),
    PSSS_PF_Cases: validateIsNumber(pf, errorHandler('pf')),
    PSSS_DLI_Cases: validateIsNumber(dli, errorHandler('dli')),
  };
  if (!isSiteSurvey) {
    answers.PSSS_Sites = validateIsNumber(sites, errorHandler('sites'));
    answers.PSSS_Sites_Reported = validateIsNumber(sitesReported, errorHandler('sitesReported'));
  }

  return answers;
};
