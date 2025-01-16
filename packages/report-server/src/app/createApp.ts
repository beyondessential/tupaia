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
export async function createApp(db = new TupaiaDatabase()) {
  const builder = new MicroServiceApiBuilder(db, 'report')
    .useBasicBearerAuth()
    .attachApiClientToContext(req => new ForwardingAuthHandler(req.headers.authorization))
    .get<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .get<FetchTransformSchemaRequest>(
      'fetchTransformSchemas',
      handleWith(FetchTransformSchemaRoute),
    )
    .post<FetchReportRequest>('fetchReport/:reportCode', handleWith(FetchReportRoute))
    .post<TestReportRequest>('testReport', handleWith(TestReportRoute));
  const app = builder.build();

  return app;
}
