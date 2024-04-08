/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertPeriodStringToDateRange } from '@tupaia/utils';
import { ApiConnection } from './ApiConnection';
import { PSSS_HIERARCHY } from '../constants';

const { REPORT_API_URL = 'http://localhost:8030/v1' } = process.env;

const buildEmptyReport = (periods: string[]) => ({
  results: [],
  metadata: { dataElementCodeToName: {} },
  period: {
    requested: periods.join(';'),
    earliestAvailable: null,
    latestAvailable: null,
  },
});

type ReportObject = {
  results: Record<string, unknown>[];
};

/**
 * @deprecated use @tupaia/api-client
 */
export class ReportConnection extends ApiConnection {
  public baseUrl = REPORT_API_URL;

  public async fetchReport(
    reportCode: string,
    orgUnitCodes: string[],
    periods: string[] = [],
  ): Promise<ReportObject> {
    if (!orgUnitCodes) {
      throw new Error('No organisationUnitCodes provided');
    }

    if (orgUnitCodes.length === 0) {
      return buildEmptyReport(periods);
    }

    const [startWeek, endWeek = startWeek] = periods;
    const [startDate] = convertPeriodStringToDateRange(startWeek);
    const [, endDate] = convertPeriodStringToDateRange(endWeek);

    return this.get(`fetchReport/${reportCode}`, {
      organisationUnitCodes: orgUnitCodes.join(','),
      startDate,
      endDate,
      hierarchy: PSSS_HIERARCHY,
    });
  }
}
