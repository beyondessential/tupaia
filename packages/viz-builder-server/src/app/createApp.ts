/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { NonSessionOrchestratorApiBuilder, handleWith } from '@tupaia/server-boilerplate';

import { hasBESAdminAccess } from '../utils';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new NonSessionOrchestratorApiBuilder(new TupaiaDatabase())
    .useBearerAuth()
    .verifyAuth(hasBESAdminAccess)
    .build();
}
