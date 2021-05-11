/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';

export class FetchActiveAlertsReportRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek, orgUnitCodes } = this.req.query;

    const reportData = await this.reportConnection?.fetchReport(
      'PSSS_Active_Alerts',
      orgUnitCodes?.split(','),
      [startWeek, endWeek],
    );

    return {
      startWeek,
      endWeek,
      data: reportData,
    };
  }
}
