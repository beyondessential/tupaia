/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { ForwardingAuthHandler } from '@tupaia/api-client';
import { TupaiaDatabase } from '@tupaia/database';
import { handleWith, MicroServiceApiBuilder } from '@tupaia/server-boilerplate';
import { attachDataTableToContext } from '../middleware';

import { FetchDataRequest, FetchDataRoute, ParametersRequest, ParametersRoute } from '../routes';

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
    .get<ParametersRequest>(
      'dataTable/:dataTableCode/parameters',
      attachDataTableToContext,
      handleWith(ParametersRoute),
    )
    .build();

  return app;
}
