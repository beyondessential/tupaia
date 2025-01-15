import { ForwardingAuthHandler } from '@tupaia/api-client';
import { TupaiaDatabase } from '@tupaia/database';
import { handleWith, MicroServiceApiBuilder } from '@tupaia/server-boilerplate';
import { attachDataTableToContext, attachDataTableFromPreviewToContext } from '../middleware';

import {
  FetchDataRequest,
  FetchDataRoute,
  ParametersRequest,
  ParametersRoute,
  FetchPreviewDataRequest,
  FetchPreviewDataRoute,
} from '../routes';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const app = new MicroServiceApiBuilder(database, 'data-table')
    .attachApiClientToContext(req => new ForwardingAuthHandler(req.headers.authorization))
    .useBasicBearerAuth()
    // Use POST for this route as we often need to pass long query arguments
    .post<FetchDataRequest>(
      'dataTable/:dataTableCode/fetchData',
      attachDataTableToContext,
      handleWith(FetchDataRoute),
    )
    .post<FetchPreviewDataRequest>(
      'dataTable/fetchPreviewData',
      attachDataTableFromPreviewToContext,
      handleWith(FetchPreviewDataRoute),
    )
    .get<ParametersRequest>(
      'dataTable/:dataTableCode/parameters',
      attachDataTableToContext,
      handleWith(ParametersRoute),
    )
    .post<ParametersRequest>(
      'dataTable/builtInParameters',
      attachDataTableFromPreviewToContext,
      handleWith(ParametersRoute),
    )
    .build();

  return app;
}
