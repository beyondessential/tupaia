/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RespondingError } from '@tupaia/utils';
import { generateId } from '@tupaia/database';
import { Route } from '../Route';
import { validateIsNumber } from '../../utils';

const CONFIRMED_WEEKLY_SURVEY_CODE = 'PSSS_Confirmed_WNR';
const ALERT_SURVEY_CODE = 'PSSS_Alert';
const WEEKLY_REPORT_CODE = 'PSSS_Weekly_Cases';
const CONFIRMED_WEEKLY_REPORT_CODE = 'PSSS_Confirmed_Weekly_Report';
const SYNDROME_CODES = ['AFR', 'DIA', 'ILI', 'PF', 'DLI'];

type ConfirmedWeeklyReportAnswers = {
  PSSS_Confirmed_Sites: number;
  PSSS_Confirmed_Sites_Reported: number;
  PSSS_Confirmed_AFR_Cases: number;
  PSSS_Confirmed_DIA_Cases: number;
  PSSS_Confirmed_ILI_Cases: number;
  PSSS_Confirmed_PF_Cases: number;
  PSSS_Confirmed_DLI_Cases: number;
};

export class ConfirmCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { week } = this.req.query;
    const { countryCode } = this.req.params;
    const confirmedData = await this.confirmData(countryCode, week);
    const alertData = await this.createAlerts(countryCode, week);

    return { confirmedData, alertData };
  }

  async confirmData(countryCode: string, week: string) {
    const report = await this.reportConnection?.fetchReport(
      WEEKLY_REPORT_CODE,
      [countryCode],
      [week],
    );

    if (!report || report.results.length === 0) {
      throw new RespondingError(
        `Cannot confirm weekly data: no weekly data found for ${countryCode} - ${week}`,
        500,
      );
    }

    const answers = mapUnconfirmedReportToConfirmedAnswers(report.results[0]);

    return this.meditrakConnection?.updateOrCreateSurveyResponse(
      CONFIRMED_WEEKLY_SURVEY_CODE,
      countryCode,
      week,
      answers,
    );
  }

  async createAlerts(countryCode: string, week: string) {
    const report = await this.reportConnection?.fetchReport(
      CONFIRMED_WEEKLY_REPORT_CODE,
      [countryCode],
      [week],
    );

    if (!report || report.results.length === 0) {
      throw new RespondingError(
        `Cannot create alerts: no confirmed weekly data found for ${countryCode} - ${week}`,
        500,
      );
    }

    const [result] = report.results;
    const response: any = {
      createdAlerts: [],
    };
    const previousAlertResponses = await this.meditrakConnection?.findSurveyResponses(
      ALERT_SURVEY_CODE,
      countryCode,
      week,
    );

    for (const syndromeCode of SYNDROME_CODES) {
      if (result[`${syndromeCode} Threshold Crossed`] === true) {
        const surveyResponseId = generateId();
        await this.meditrakConnection?.createSurveyResponse(
          ALERT_SURVEY_CODE,
          countryCode,
          week,
          {
            PSSS_Alert_Syndrome: syndromeCode,
            PSSS_Alert_Archived: 'No',
          },
          surveyResponseId,
        );

        response.createdAlerts.push({
          id: surveyResponseId,
          title: syndromeCode,
        });
      }
    }

    if (previousAlertResponses && previousAlertResponses.length) {
      // delete the old alerts in case the weekly data is
      // re-confirmed and there have been some alerts created before
      for (const alertResponse of previousAlertResponses) {
        await this.meditrakConnection?.deleteSurveyResponse(alertResponse);
      }
    }

    return response;
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
