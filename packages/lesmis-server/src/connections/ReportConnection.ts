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

/**
 * @deprecated use @tupaia/api-client
 */
export class ReportConnection extends SessionHandlingApiConnection {
  public baseUrl = REPORT_API_URL;

  public async fetchReport(reportCode: string, query: QueryParameters): Promise<ReportObject> {
    return this.get(`fetchReport/${reportCode}`, query);
  }
}
