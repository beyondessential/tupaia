/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Route } from '../Route';
import { PSSS_PERMISSION_GROUP } from '../../constants';

export class ConfirmedWeeklyReportRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek } = this.req.query;
    const countryCodes = await this.getAccessibleCountryCodes();
    const reportData = await this.reportConnection?.fetchReport(
      'PSSS_Confirmed_Weekly_Report',
      countryCodes,
      [startWeek], //Only need to send startWeek period because this is a weekly report
    );

    return {
      startWeek,
      endWeek,
      data: reportData,
    };
  }

  async getAccessibleCountryCodes() {
    const { accessPolicy } = await this.getSession();
    return accessPolicy.getEntitiesAllowed(PSSS_PERMISSION_GROUP);
  }
}
