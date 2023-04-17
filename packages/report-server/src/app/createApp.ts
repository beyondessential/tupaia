/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import { ForwardingAuthHandler } from '@tupaia/api-client';
import {
  FetchReportRequest,
  FetchReportRoute,
  FetchTransformSchemaRoute,
  TestReportRequest,
  TestReportRoute,
} from '../routes';
import { FetchTransformSchemaRequest } from '../routes/FetchTransformSchemaRoute';

/**
 * Set up express server
 */
export function createApp() {
  return new MicroServiceApiBuilder(new TupaiaDatabase(), 'report')
    .useBasicBearerAuth()
    .attachApiClientToContext(req => new ForwardingAuthHandler(req.headers.authorization))
    .get<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .get<FetchTransformSchemaRequest>(
      'fetchTransformSchemas',
      handleWith(FetchTransformSchemaRoute),
    )
    .post<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .post<TestReportRequest>('testReport', handleWith(TestReportRoute))
    .build();
}
