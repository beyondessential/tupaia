/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import {
  FetchReportRequest,
  FetchReportRoute,
  FetchAggregationOptionsRequest,
  FetchAggregationOptionsRoute,
  TestReportRequest,
  TestReportRoute,
} from '../routes';

/**
 * Set up express server
 */
export function createApp() {
  return new MicroServiceApiBuilder(new TupaiaDatabase())
    .useBasicBearerAuth('report-server')
    .get<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .get<FetchAggregationOptionsRequest>(
      'fetchAggregationOptions/:searchText?',
      handleWith(FetchAggregationOptionsRoute),
    )
    .post<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .post<TestReportRequest>('testReport', handleWith(TestReportRoute))
    .build();
}
