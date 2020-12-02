/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';

export class ConfirmedCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek } = this.req.query;
    const { organisationUnitCode: countryCode } = this.req.params;
    const reportData = await this.reportConnection?.fetchReport(
      'PSSS_Confirmed_Weekly_Report',
      [countryCode],
      [startWeek, endWeek],
    );

    return {
      startWeek,
      endWeek,
      country: countryCode,
      data: reportData,
    };
  }
}
