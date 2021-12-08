/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RespondingError, UnauthenticatedError } from '@tupaia/utils';
import { Route } from '../Route';
import { WEEKLY_SURVEY_COUNTRY, WEEKLY_SURVEY_SITE } from '../../constants';
import { validateIsNumber } from '../../utils';

type WeeklyReportAnswer = {
  type: string;
  code: string;
  value: number;
};

export class SaveWeeklyReportRoute extends Route {
  async buildResponse() {
    if (!this.meditrakConnection) throw new UnauthenticatedError('Unauthenticated');

    const { week } = this.req.query;
    const { countryCode, siteCode } = this.req.params;

    const isSiteSurvey = !!siteCode;
    const answers = mapReqBodyToAnswers(this.req.body, isSiteSurvey);

    return this.meditrakConnection.updateOrCreateSurveyResponse(
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

  const answers: WeeklyReportAnswer[] = [
    {
      type: 'Number',
      code: 'PSSS_AFR_Cases',
      value: validateIsNumber(afr, errorHandler('afr')),
    },
    {
      type: 'Number',
      code: 'PSSS_DIA_Cases',
      value: validateIsNumber(dia, errorHandler('dia')),
    },
    {
      type: 'Number',
      code: 'PSSS_ILI_Cases',
      value: validateIsNumber(ili, errorHandler('ili')),
    },
    {
      type: 'Number',
      code: 'PSSS_PF_Cases',
      value: validateIsNumber(pf, errorHandler('pf')),
    },
    {
      type: 'Number',
      code: 'PSSS_DLI_Cases',
      value: validateIsNumber(dli, errorHandler('dli')),
    },
  ];

  if (!isSiteSurvey) {
    answers.push({
      type: 'Number',
      code: 'PSSS_Sites',
      value: validateIsNumber(sites, errorHandler('sites')),
    });
    answers.push({
      type: 'Number',
      code: 'PSSS_Sites_Reported',
      value: validateIsNumber(sitesReported, errorHandler('sitesReported')),
    });
  }

  return answers;
};
