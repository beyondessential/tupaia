/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Route } from '../Route';
import { validateSyndrome } from './helpers';
import { UnauthenticatedError } from '@tupaia/utils';

export class FetchConfirmedWeeklyReportRoute extends Route {
  async buildResponse() {
    if (!this.reportConnection) throw new UnauthenticatedError('Unauthenticated');

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
