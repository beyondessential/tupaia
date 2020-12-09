/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';

const SURVEY_CODE = 'PSSS_WNR';

type WeeklyReportAnswers = {
  PSSS_Sites: number;
  PSSS_Sites_Reported: number;
  PSSS_AFR_Cases: number;
  PSSS_DIA_Cases: number;
  PSSS_ILI_Cases: number;
  PSSS_PF_Cases: number;
  PSSS_DLI_Cases: number;
};

export class SubmitCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { week } = this.req.query;
    const { organisationUnitCode } = this.req.params;
    const answers = mapReqBodyToAnswers(this.req.body);

    const existingSurveyResponse = await this.meditrakConnection?.findSurveyResponse(
      SURVEY_CODE,
      organisationUnitCode,
      week,
    );

    if (existingSurveyResponse) {
      return this.meditrakConnection?.updateSurveyResponse(existingSurveyResponse, answers);
    }

    return this.meditrakConnection?.createSurveyResponse(
      SURVEY_CODE,
      organisationUnitCode,
      week,
      answers,
    );
  }
}

const mapReqBodyToAnswers = (body: Record<string, unknown>): WeeklyReportAnswers => {
  const { sites, sitesReported, afr, dia, ili, pf, dli } = body;
  return {
    PSSS_Sites: validateIsNumber(sites),
    PSSS_Sites_Reported: validateIsNumber(sitesReported),
    PSSS_AFR_Cases: validateIsNumber(afr),
    PSSS_DIA_Cases: validateIsNumber(dia),
    PSSS_ILI_Cases: validateIsNumber(ili),
    PSSS_PF_Cases: validateIsNumber(pf),
    PSSS_DLI_Cases: validateIsNumber(dli),
  };
};

const validateIsNumber = (value: unknown): number => {
  if (typeof value !== 'number') {
    throw new RespondingError(`Cannot save weekly data: ${value} is not a number`, 500);
  }

  return value;
};
