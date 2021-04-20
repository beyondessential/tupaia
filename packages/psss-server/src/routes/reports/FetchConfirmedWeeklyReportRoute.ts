/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Route } from '../Route';

export class FetchConfirmedWeeklyReportRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek, orgUnitCodes } = this.req.query;
    const reportData = await this.reportConnection?.fetchReport(
      'PSSS_Confirmed_Weekly_Report',
      orgUnitCodes?.split(','),
      [startWeek], // Only need to send startWeek period because this is a weekly report
    );

    return {
      startWeek,
      endWeek,
      data: reportData,
    };
  }
}
