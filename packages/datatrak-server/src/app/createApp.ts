/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { OrchestratorApiBuilder } from '@tupaia/server-boilerplate';
import { authHandlerProvider } from '../auth';
import { DatatrakSessionModel } from '../models';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const app = new OrchestratorApiBuilder(database, 'datatrak')
    .useSessionModel(DatatrakSessionModel)
    .attachApiClientToContext(authHandlerProvider)
    .build();

  return app;
}
