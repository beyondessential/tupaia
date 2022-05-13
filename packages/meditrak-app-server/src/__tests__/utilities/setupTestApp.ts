/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { getTestDatabase } from '@tupaia/database';

import { createApp } from '../../app';

export const setupTestApp = async () => {
  const app = new TestableServer(createApp(getTestDatabase()));

  return app;
};
