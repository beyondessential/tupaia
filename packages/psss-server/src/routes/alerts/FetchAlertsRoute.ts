import { Request } from 'express';
import { getCurrentPeriod } from '@tupaia/utils';
import { Route } from '../Route';

const CATEGORY_TO_REPORT = {
  archive: 'PSSS_Archived_Alerts',
  active: 'PSSS_Active_Alerts',
};

type AlertCategory = keyof typeof CATEGORY_TO_REPORT;

type AlertReportRow = {
  organisationUnit: string;
  period: string;
  syndrome: string;
};

function validateStatus(category: string): asserts category is AlertCategory {
  const categories = Object.keys(CATEGORY_TO_REPORT);
  if (!categories.includes(category)) {
    throw new Error(`Invalid alert category '${category}', must be one of ${categories}`);
  }
}

export type FetchAlertsRequest = Request<
  { category: string },
  any,
  Record<string, unknown>,
  { startWeek: string; endWeek: string; orgUnitCodes: string }
>;

export class FetchAlertsRoute extends Route<FetchAlertsRequest> {
  public async buildResponse() {
    const { startWeek, endWeek } = this.req.query;

    const alertData: AlertReportRow[] = await this.fetchAlertData();
    const data = await Promise.all(
      alertData.map(async alert => {
        const confirmedData = await this.fetchConfirmedDataForAlert(alert);
        return { ...alert, ...confirmedData };
      }),
    );

    return {
      startWeek,
      endWeek,
      data,
    };
  }

  private fetchAlertData = async () => {
    const { startWeek, endWeek, orgUnitCodes } = this.req.query;
    const { category } = this.req.params;

    validateStatus(category);
    const alertReport = CATEGORY_TO_REPORT[category];
    const { results } = await this.reportConnection.fetchReport(
      alertReport,
      orgUnitCodes?.split(','),
      [startWeek, endWeek],
    );

    return results as AlertReportRow[];
  };

  private fetchConfirmedDataForAlert = async (alert: AlertReportRow) => {
    const { organisationUnit, period, syndrome } = alert;
    const { results } = await this.reportConnection.fetchReport(
      `PSSS_${syndrome}_Confirmed_Report`,
      [organisationUnit],
      [period, getCurrentPeriod('WEEK')],
    );

    return results[0];
  };
}
