/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';
import { validateIsNumber } from '../../utils';

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

    return this.meditrakConnection?.updateOrCreateSurveyResponse(
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

  const errorHandler = (field: string) => (value: unknown) =>
    new RespondingError(
      `Cannot confirm weekly data: Invalid value for '${field}' - ${value} is not a number`,
      500,
    );

  return {
    PSSS_Confirmed_Sites: validateIsNumber(sites, errorHandler('Sites')),
    PSSS_Confirmed_Sites_Reported: validateIsNumber(sitesReported, errorHandler('Sites Reported')),
    PSSS_Confirmed_AFR_Cases: validateIsNumber(afr, errorHandler('AFR')),
    PSSS_Confirmed_DIA_Cases: validateIsNumber(dia, errorHandler('DIA')),
    PSSS_Confirmed_ILI_Cases: validateIsNumber(ili, errorHandler('ILI')),
    PSSS_Confirmed_PF_Cases: validateIsNumber(pf, errorHandler('PF')),
    PSSS_Confirmed_DLI_Cases: validateIsNumber(dli, errorHandler('DLI')),
  };
};
