import { groupBy } from 'es-toolkit/compat';
import { RespondingError, dateStringToPeriod } from '@tupaia/utils';
import { Request } from 'express';
import { Route } from '../Route';
import { validateIsNumber } from '../../utils';
import {
  MIN_DATE,
  SYNDROME_CODES,
  CONFIRMED_WEEKLY_SURVEY_COUNTRY,
  ALERT_SURVEY,
} from '../../constants';

const WEEKLY_REPORT_CODE = 'PSSS_Weekly_Cases';
const ACTIVE_ALERTS_REPORT_CODE = 'PSSS_Active_Alerts';
const CONFIRMED_WEEKLY_REPORT_CODE = 'PSSS_Confirmed_Weekly_Report';

type AlertResponseData = {
  createdAlerts: {
    id: string;
    title: string;
  }[];
  alertsArchived: boolean;
};

export type ConfirmWeeklyReportRequest = Request<
  { countryCode: string },
  any,
  Record<string, unknown>,
  { week: string }
>;

export class ConfirmWeeklyReportRoute extends Route<ConfirmWeeklyReportRequest> {
  public async buildResponse() {
    const { week } = this.req.query;
    const { countryCode } = this.req.params;
    const confirmedData = await this.confirmData(countryCode, week);
    const alertData = await this.updateAlerts(countryCode, week);

    return { confirmedData, alertData };
  }

  private async confirmData(countryCode: string, week: string) {
    const report = await this.reportConnection.fetchReport(
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

    return this.centralConnection.updateOrCreateSurveyResponse(
      CONFIRMED_WEEKLY_SURVEY_COUNTRY,
      countryCode,
      week,
      answers,
    );
  }

  private async updateAlerts(countryCode: string, week: string) {
    const report = await this.reportConnection.fetchReport(
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
    const response: AlertResponseData = {
      createdAlerts: [],
      alertsArchived: false,
    };
    const startWeek = dateStringToPeriod(MIN_DATE, 'WEEK');
    const activeAlertsData = await this.reportConnection.fetchReport(
      ACTIVE_ALERTS_REPORT_CODE,
      [countryCode],
      [startWeek, week],
    );

    if (!activeAlertsData) {
      // should not be undefined even if there is no data
      throw new RespondingError(
        `Cannot create alerts: could not fetch pre-existing alert data`,
        500,
      );
    }

    const { results: alerts } = activeAlertsData;
    const alertsBySyndrome = groupBy(alerts, 'syndrome');

    for (const syndromeCode of SYNDROME_CODES) {
      const syndromeAlerts = alertsBySyndrome[syndromeCode];

      // If there is no existing active alert for this syndrome,
      // and the threshold is crossed for this syndrome, create a new one
      if (!syndromeAlerts && result[`${syndromeCode} Threshold Crossed`] === true) {
        const { surveyResponseId } = await this.createAlert(countryCode, week, syndromeCode);
        response.createdAlerts.push({
          id: surveyResponseId,
          title: syndromeCode,
        });

        continue;
      }

      const currentWeekSyndromeAlert =
        syndromeAlerts && syndromeAlerts.find(a => a.period === week);

      // If there is an existing alert triggered in the selected week,
      // and now for the selected week, the threshold is no longer crossed (because of reconfirming changed data),
      // archive the existing alert triggered in the selected week
      if (currentWeekSyndromeAlert && result[`${syndromeCode} Threshold Crossed`] === false) {
        await this.archiveAlert(currentWeekSyndromeAlert.id as string, countryCode, week);
        response.alertsArchived = true;
      }
    }

    return response;
  }

  private async createAlert(countryCode: string, week: string, syndromeCode: string) {
    return this.centralConnection.createSurveyResponse(ALERT_SURVEY, countryCode, week, [
      { code: 'PSSS_Alert_Syndrome', value: syndromeCode },
      { code: 'PSSS_Alert_Archived', value: 'No' },
    ]);
  }

  private async archiveAlert(alertId: string, countryCode: string, week: string) {
    return this.centralConnection.updateSurveyResponse(alertId, countryCode, ALERT_SURVEY, week, [
      { code: 'PSSS_Alert_Archived', value: 'Yes' },
    ]);
  }
}

const mapUnconfirmedReportToConfirmedAnswers = (reportValues: Record<string, unknown>) => {
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

  return [
    {
      code: 'PSSS_Confirmed_Sites',
      value: validateIsNumber(sites, errorHandler('Sites')),
    },
    {
      code: 'PSSS_Confirmed_Sites_Reported',
      value: validateIsNumber(sitesReported, errorHandler('Sites Reported')),
    },
    {
      code: 'PSSS_Confirmed_AFR_Cases',
      value: validateIsNumber(afr, errorHandler('AFR')),
    },
    {
      code: 'PSSS_Confirmed_DIA_Cases',
      value: validateIsNumber(dia, errorHandler('DIA')),
    },
    {
      code: 'PSSS_Confirmed_ILI_Cases',
      value: validateIsNumber(ili, errorHandler('ILI')),
    },
    {
      code: 'PSSS_Confirmed_PF_Cases',
      value: validateIsNumber(pf, errorHandler('PF')),
    },
    {
      code: 'PSSS_Confirmed_DLI_Cases',
      value: validateIsNumber(dli, errorHandler('DLI')),
    },
  ];
};
