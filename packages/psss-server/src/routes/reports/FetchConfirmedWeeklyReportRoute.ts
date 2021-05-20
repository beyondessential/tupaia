/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Route } from '../Route';

export class FetchConfirmedWeeklyReportRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek, orgUnitCodes } = this.req.query;
    const { countryCode } = this.req.params;
    const entityCodes = countryCode ? [countryCode] : orgUnitCodes?.split(',');

    const reportData = await this.reportConnection?.fetchReport(
      'PSSS_Confirmed_Weekly_Report',
      entityCodes,
      [startWeek, endWeek],
    );

    return {
      startWeek,
      endWeek,
      data: reportData,
    };
  }
}
