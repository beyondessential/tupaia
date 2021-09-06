/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
  baseUrl = REPORT_API_URL;

  async fetchReport(
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

    return this.get(`fetchReport/${reportCode}`, {
      organisationUnitCodes: orgUnitCodes.join(','),
      period: periods.join(';'),
      hierarchy: PSSS_HIERARCHY,
    });
  }
}
