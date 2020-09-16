/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { fetchReport } from '../routes';

export function addRoutesToApp(app) {
  /**
   * GET routes
   **/
  app.get('(/v[0-9]+)?/fetchReport', fetchReport);
}
