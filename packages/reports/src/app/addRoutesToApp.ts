/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { fetchReport } from '../routes';
import { authenticationMiddleware } from '../auth';

export function addRoutesToApp(app) {
  /**
   * Attach authentication to each endpoint
   */
  app.use(authenticationMiddleware);

  /**
   * POST routes
   */
  app.post('(/v[0-9]+)?/fetchReport/:reportCode', fetchReport);
}
