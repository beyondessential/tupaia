/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { Route } from '../Route';
import { validateSyndrome } from './helpers';

export type FetchWeeklyReportRequest = Request<
  { countryCode: string; sites: 'sites' | undefined },
  any,
  Record<string, unknown>,
  { startWeek: string; endWeek: string; syndrome: string }
>;

export class FetchWeeklyReportRoute extends Route<FetchWeeklyReportRequest> {
  public async buildResponse() {
    if (!this.reportConnection) throw new UnauthenticatedError('Unauthenticated');
    if (!this.entityConnection) throw new UnauthenticatedError('Unauthenticated');

    const { startWeek, endWeek, syndrome } = this.req.query;
    const { countryCode, sites } = this.req.params;

    if (syndrome) {
      validateSyndrome(syndrome);
    }

    const entityCodes = sites
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
