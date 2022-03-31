/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import {
  ForwardingAuthHandler,
  getBaseUrlsForHost,
  LOCALHOST_BASE_URLS,
  TupaiaApiClient,
} from '@tupaia/api-client';
import {
  FetchReportRequest,
  FetchReportRoute,
  FetchAggregationOptionsRequest,
  FetchAggregationOptionsRoute,
  FetchTransformSchemaRoute,
  TestReportRequest,
  TestReportRoute,
} from '../routes';
import { RequestContext } from '../types';
import { FetchTransformSchemaRequest } from '../routes/FetchTransformSchemaRoute';

/**
 * Set up express server
 */
export function createApp() {
  return new MicroServiceApiBuilder(new TupaiaDatabase())
    .useBasicBearerAuth('report-server')
    .middleware((req, res, next) => {
      const baseUrls =
        process.env.NODE_ENV === 'test' ? LOCALHOST_BASE_URLS : getBaseUrlsForHost(req.hostname);
      const context: RequestContext = {
        services: new TupaiaApiClient(
          new ForwardingAuthHandler(req.headers.authorization),
          baseUrls,
        ),
      };
      req.ctx = context;
      res.ctx = context;
      next();
    })
    .get<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .get<FetchAggregationOptionsRequest>(
      'fetchAggregationOptions',
      handleWith(FetchAggregationOptionsRoute),
    )
    .get<FetchTransformSchemaRequest>(
      'fetchTransformSchemas',
      handleWith(FetchTransformSchemaRoute),
    )
    .post<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .post<TestReportRequest>('testReport', handleWith(TestReportRoute))
    .build();
}
