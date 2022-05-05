/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { MicroServiceApiBuilder } from '@tupaia/server-boilerplate';
import {
  ForwardingAuthHandler,
  getBaseUrlsForHost,
  LOCALHOST_BASE_URLS,
  TupaiaApiClient,
} from '@tupaia/api-client';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new MicroServiceApiBuilder(new TupaiaDatabase())
    .middleware((req, res, next) => {
      const baseUrls =
        process.env.NODE_ENV === 'test' ? LOCALHOST_BASE_URLS : getBaseUrlsForHost(req.hostname);
      const context = {
        services: new TupaiaApiClient(
          new ForwardingAuthHandler(req.headers.authorization),
          baseUrls,
        ),
      };
      req.ctx = context;
      res.ctx = context;
      next();
    })
    .build();

  return app;
}
