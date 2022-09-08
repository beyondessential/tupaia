/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { MicroServiceApiBuilder } from '@tupaia/server-boilerplate';

/**
 * Set up express server with middleware,
 */
export function createApp(database = new TupaiaDatabase()) {
  const app = new MicroServiceApiBuilder(database, 'data-table').useBasicBearerAuth().build();

  return app;
}
