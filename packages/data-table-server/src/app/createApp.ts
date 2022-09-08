/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { ForwardingAuthHandler } from '@tupaia/api-client';
import { TupaiaDatabase } from '@tupaia/database';
import { handleWith, MicroServiceApiBuilder } from '@tupaia/server-boilerplate';

import { FetchDataTableDataRequest, FetchDataTableDataRoute } from '../routes';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const app = new MicroServiceApiBuilder(database, 'data-table')
    .attachApiClientToContext(req => new ForwardingAuthHandler(req.headers.authorization))
    .useBasicBearerAuth()
    .post<FetchDataTableDataRequest>(
      'dataTable/:dataTableCode/fetchData',
      handleWith(FetchDataTableDataRoute),
    ) // Use POST for this route as we often need to pass long query arguments
    .build();

  return app;
}
