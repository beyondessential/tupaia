/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp } from './testUtilities';

jest.mock('@tupaia/api-client', () => {
  const { MockTupaiaApiClient, handleServerError } = jest.requireActual('@tupaia/api-client');
  return {
    TupaiaApiClient: jest.fn().mockImplementation(() => {
      return new MockTupaiaApiClient({
        entity: {
          getEntity: jest.fn(() => handleServerError(444, 'My error')),
        },
      });
    }),
  };
});

describe('Error responses', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  describe('Microservice errors', () => {
    it('Returns the original error from the backing server', async () => {
      const response = await app.get('entity/oracleages/YOLLS');
      expect(response.body).toEqual({ error: 'My error' });
      expect(response.statusCode).toEqual(444);
    });
  });
});
