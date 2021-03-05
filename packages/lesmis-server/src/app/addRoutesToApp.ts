/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Express } from 'express';
import {
  TestRoute,
  LoginRoute,
  LogoutRoute,
  handleWith,
  handleError,
} from '@tupaia/server-boilerplate';
import { UserRoute } from '../routes';

export function addRoutesToApp(app: Express) {
  /**
   * GET routes
   */
  app.get('/v1/test', handleWith(TestRoute));
  app.get('/v1/user', handleWith(UserRoute));

  /**
   * POST routes
   */
  app.post('/v1/login', handleWith(LoginRoute));
  app.post('/v1/logout', handleWith(LogoutRoute));

  /**
   * PUT routes
   */

  /**
   * DELETE routes
   */

  app.use(handleError);
}
