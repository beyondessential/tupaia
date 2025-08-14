import { Request } from 'express';
import { Route } from '../Route';
import { validateSyndrome } from './helpers';

export type FetchConfirmedWeeklyReportRequest = Request<
  { countryCode: string },
  any,
  Record<string, unknown>,
  { startWeek: string; endWeek: string; orgUnitCodes: string; syndrome: string }
>;

export class FetchConfirmedWeeklyReportRoute extends Route<FetchConfirmedWeeklyReportRequest> {
  public async buildResponse() {
    const { startWeek, endWeek, orgUnitCodes, syndrome } = this.req.query;
    const { countryCode } = this.req.params;
    const entityCodes = countryCode ? [countryCode] : orgUnitCodes?.split(',');

    if (syndrome) {
      validateSyndrome(syndrome);
    }

    const report = syndrome
      ? `PSSS_${syndrome}_Confirmed_Weekly_Report`
      : 'PSSS_Confirmed_Weekly_Report';
    const reportData = await this.reportConnection.fetchReport(report, entityCodes, [
      startWeek,
      endWeek,
    ]);

    return {
      startWeek,
      endWeek,
      data: reportData,
    };
  }
}
