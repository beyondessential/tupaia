import { TestableServer } from '@tupaia/server-boilerplate';
import { getTestDatabase } from '@tupaia/database';

import { createApp } from '../../app';

const TEST_APP_VERSION = '1.11.121';

type ApiClientMocks = { auth?: any; central?: any };

const apiClientMocks: ApiClientMocks = {};

jest.mock('@tupaia/api-client', () => {
  const original = jest.requireActual('@tupaia/api-client');
  return {
    ...original,
    TupaiaApiClient: jest.fn().mockImplementation(() => {
      return apiClientMocks;
    }),
  };
});

export const setupTestApp = async (newApiClientMocks: ApiClientMocks = {}) => {
  Object.entries(newApiClientMocks).forEach(([service, mock]) => {
    apiClientMocks[service as keyof ApiClientMocks] = mock;
  });

  const app = new TestableServer(createApp(getTestDatabase()));
  app.setDefaultQueryParam('appVersion', TEST_APP_VERSION);

  return app;
};
