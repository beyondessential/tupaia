/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests,
} from '@tupaia/server-boilerplate';
import { SessionSwitchingAuthHandler } from '@tupaia/api-client';
import { TupaiaWebSessionModel } from '../models';
import {
  ReportRoute,
  UserRoute,
  TempLogoutRoute,

  ReportRequest,
  UserRequest,
  TempLogoutRequest,
} from '../routes';

const { WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1' } = process.env;

export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'tupaia-web')
    .attachApiClientToContext(req => new SessionSwitchingAuthHandler(req.session))
    .useSessionModel(TupaiaWebSessionModel)
    .get<ReportRequest>('report/:reportCode', handleWith(ReportRoute))
    .get<UserRequest>('getUser', handleWith(UserRoute))
    // TODO: Stop using get for logout, then delete this
    .get<TempLogoutRequest>('logout', handleWith(TempLogoutRoute))
    .build();

  useForwardUnhandledRequests(app, WEB_CONFIG_API_URL);

  return app;
}
