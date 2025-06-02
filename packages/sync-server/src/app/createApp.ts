/**
 * Tupaia
 * Copyright (c) 2017 - 2025 Beyond Essential Systems Pty Ltd
 */
import { ForwardingAuthHandler } from '@tupaia/api-client';
import { TupaiaDatabase } from '@tupaia/database';
import { MicroServiceApiBuilder } from '@tupaia/server-boilerplate';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const app = new MicroServiceApiBuilder(database, 'sync')
    .attachApiClientToContext(req => new ForwardingAuthHandler(req.headers.authorization))
    .useBasicBearerAuth()
    .build();

  return app;
}
