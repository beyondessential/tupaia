/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters } from '@tupaia/server-boilerplate';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';

const { REPORT_API_URL = 'http://localhost:8030/v2' } = process.env;

type ReportObject = {
  results: Record<string, unknown>[];
};
export class ReportConnection extends SessionHandlingApiConnection {
  baseUrl = REPORT_API_URL;

  async fetchReport(
    reportCode: string,
    orgUnitCodes: string[],
    periods: string[] = [],
  ): Promise<ReportObject> {
    if (!orgUnitCodes || !orgUnitCodes.length) {
      throw new Error('No organisationUnitCodes provided');
    }

    return this.get(`fetchReport/${reportCode}`, {
      organisationUnitCodes: orgUnitCodes.join(','),
      period: periods.join(';'),
    });
  }

  async forwardReportQuery(reportCode: string, query: QueryParameters) {
    return this.get(`fetchReport/${reportCode}`, query);
  }
}
