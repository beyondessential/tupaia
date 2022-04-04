/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters, ApiConnection, RequestBody } from '@tupaia/server-boilerplate';

const { REPORT_API_URL = 'http://localhost:8030/v2' } = process.env;

/**
 * @deprecated use @tupaia/api-client
 */
export class ReportConnection extends ApiConnection {
  public baseUrl = REPORT_API_URL;

  public async testReport(query: QueryParameters, body: RequestBody) {
    return this.post('testReport', query, body);
  }

  public async fetchAggregationOptions() {
    return this.get('fetchAggregationOptions');
  }

  public async fetchTransformSchemas() {
    return this.get('fetchTransformSchemas');
  }
}
