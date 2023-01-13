/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters } from '../types';
import { RequestBody } from './ApiConnection';
import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class ReportApi extends BaseApi {
  public async testReport(query: QueryParameters, body: RequestBody) {
    return this.connection.post('testReport', query, body);
  }

  public async fetchAggregationOptions() {
    return this.connection.get('fetchAggregationOptions');
  }

  public async fetchTransformSchemas() {
    return this.connection.get('fetchTransformSchemas');
  }
}

export interface ReportApiInterface extends PublicInterface<ReportApi> {}
