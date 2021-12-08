/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';
import { validateSyndrome } from './helpers';
import { UnauthenticatedError } from '@tupaia/utils';

export class FetchWeeklyReportRoute extends Route {
  async buildResponse() {
    if (!this.reportConnection) throw new UnauthenticatedError('Unauthenticated');

    const { startWeek, endWeek, syndrome } = this.req.query;
    const { countryCode } = this.req.params;

    if (syndrome) {
      validateSyndrome(syndrome);
    }

    const entityCodes = this.req.useSites
      ? await this.entityConnection.fetchSiteCodes(countryCode)
      : [countryCode];
    const report = syndrome ? `PSSS_${syndrome}_Weekly_Report` : 'PSSS_Weekly_Report';
    const reportData = await this.reportConnection.fetchReport(report, entityCodes, [
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
}
