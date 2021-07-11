/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters } from '@tupaia/server-boilerplate';

import { NonSessionApiConnection } from './NonSessionApiConnection';

const { REPORT_API_URL = 'http://localhost:8030/v2' } = process.env;

type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export class ReportConnection extends NonSessionApiConnection {
  baseUrl = REPORT_API_URL;

  async fetchReport(reportCode: string, query: QueryParameters, body: RequestBody) {
    return this.post(`fetchReport/${reportCode}`, query, body);
  }
}
