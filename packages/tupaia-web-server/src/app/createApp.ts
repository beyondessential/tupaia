/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests,
} from '@tupaia/server-boilerplate';
import { SessionSwitchingAuthHandler } from '@tupaia/api-client';
import { TupaiaWebSessionModel } from '../models';

const { WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1' } = process.env;

export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'tupaia-web')
    .attachApiClientToContext(req => new SessionSwitchingAuthHandler(req.session))
    .useSessionModel(TupaiaWebSessionModel)
    .build();

  useForwardUnhandledRequests(app, WEB_CONFIG_API_URL);

  return app;
}
