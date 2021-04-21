/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';

export class FetchCountryWeeklyReportRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek } = this.req.query;
    const { organisationUnitCode: countryCode } = this.req.params;

    const entityCodes = await this.buildEntityCodes();
    const reportData = await this.reportConnection?.fetchReport('PSSS_Weekly_Report', entityCodes, [
      startWeek,
      endWeek,
    ]);

    return {
      startWeek,
      endWeek,
      country: countryCode,
      data: reportData,
    };
  }

  buildEntityCodes = async () => {
    const { useSites } = this.req;
    const { organisationUnitCode: countryCode } = this.req.params;
    const sites = useSites ? await this.entityConnection.fetchSites(countryCode) : [];

    return [countryCode, ...sites.map(s => s.code)];
  };
}
