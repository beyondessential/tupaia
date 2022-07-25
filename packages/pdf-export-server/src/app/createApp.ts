/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceApiBuilder } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';

/**
 * Set up express server with middleware
 */
export function createApp(db = new TupaiaDatabase()) {
  return new MicroServiceApiBuilder(db, 'pdf-export').useBasicBearerAuth().build();
}
