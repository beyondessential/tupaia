/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ReportApiInterface } from '../../connections';
import { RequestBody } from '../../connections/ApiConnection';
import { QueryParameters } from '../../types';

export class MockReportApi implements ReportApiInterface {
  public testReport(query: QueryParameters, body: RequestBody): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchAggregationOptions(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchTransformSchemas(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
