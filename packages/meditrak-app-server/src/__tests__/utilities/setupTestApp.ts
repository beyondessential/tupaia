/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { getTestDatabase } from '@tupaia/database';

import { createApp } from '../../app';
import { TEST_DATA } from '../__integration__/fixtures';
import { AuthApiMock } from './AuthApiMock';
import { CentralApiMock } from './CentralApiMock';

jest.mock('@tupaia/api-client', () => {
  const original = jest.requireActual('@tupaia/api-client'); // Step 2.
  return {
    ...original,
    TupaiaApiClient: jest.fn().mockImplementation(() => {
      return {
        auth: new AuthApiMock(TEST_DATA),
        central: new CentralApiMock(),
      };
    }),
  };
});

export const setupTestApp = async () => {
  const app = new TestableServer(createApp(getTestDatabase()));

  return app;
};
