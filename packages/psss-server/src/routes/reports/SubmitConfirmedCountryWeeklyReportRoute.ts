/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';

const SURVEY_CODE = 'PSSS_Confirmed_WNR';
const REPORT_CODE = 'PSSS_Weekly_Cases';

type ConfirmedWeeklyReportAnswers = {
  PSSS_Confirmed_Sites: number;
  PSSS_Confirmed_Sites_Reported: number;
  PSSS_Confirmed_AFR_Cases: number;
  PSSS_Confirmed_DIA_Cases: number;
  PSSS_Confirmed_ILI_Cases: number;
  PSSS_Confirmed_PF_Cases: number;
  PSSS_Confirmed_DLI_Cases: number;
};

export class SubmitConfirmedCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { week } = this.req.query;
    const { organisationUnitCode } = this.req.params;

    const report = await this.reportConnection?.fetchReport(
      REPORT_CODE,
      [organisationUnitCode],
      [week],
    );

    if (!report || report.results.length === 0) {
      throw new RespondingError(
        `Cannot confirm weekly data: no weekly data found for ${organisationUnitCode} - ${week}`,
        500,
      );
    }

    const answers = mapUnconfirmedReportToConfirmedAnswers(report.results[0]);

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

const mapUnconfirmedReportToConfirmedAnswers = (
  reportValues: Record<string, unknown>,
): ConfirmedWeeklyReportAnswers => {
  const {
    Sites: sites,
    'Sites Reported': sitesReported,
    AFR: afr,
    DIA: dia,
    ILI: ili,
    PF: pf,
    DLI: dli,
  } = reportValues;
  return {
    PSSS_Confirmed_Sites: validateIsNumber(sites),
    PSSS_Confirmed_Sites_Reported: validateIsNumber(sitesReported),
    PSSS_Confirmed_AFR_Cases: validateIsNumber(afr),
    PSSS_Confirmed_DIA_Cases: validateIsNumber(dia),
    PSSS_Confirmed_ILI_Cases: validateIsNumber(ili),
    PSSS_Confirmed_PF_Cases: validateIsNumber(pf),
    PSSS_Confirmed_DLI_Cases: validateIsNumber(dli),
  };
};

const validateIsNumber = (value: unknown): number => {
  if (typeof value !== 'number') {
    throw new RespondingError(`Cannot confirm weekly data: invalid data`, 500);
  }

  return value;
};
