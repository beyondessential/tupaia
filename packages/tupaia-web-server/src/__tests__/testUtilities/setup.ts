/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { createBasicHeader } from '@tupaia/utils';
import { TestableServer } from '@tupaia/server-boilerplate';

import { getTestDatabase } from '@tupaia/database';

import { createApp } from '../../app';

// Don't generate the proxy middlewares while we're testing
jest.mock('http-proxy-middleware');

const userAccountEmail = 'ash-ketchum@pokemon.org';
const userAccountPassword = 'test';

export const setupTestApp = async () => {
  const app = new TestableServer(await createApp(getTestDatabase()));
  app.setDefaultHeader('Authorization', createBasicHeader(userAccountEmail, userAccountPassword));
  return app;
};
