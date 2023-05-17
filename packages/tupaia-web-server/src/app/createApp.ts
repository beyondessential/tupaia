/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase, UserSessionModel } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests
} from '@tupaia/server-boilerplate';

const { WEB_CONFIG_API_URL = 'http://localhost:8000/v1' } = process.env;

export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'tupaia-web')
    .useSessionModel(UserSessionModel)
    .build();

  useForwardUnhandledRequests(app, WEB_CONFIG_API_URL, '');
}
