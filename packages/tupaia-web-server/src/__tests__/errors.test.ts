/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp } from './testUtilities';

describe('Error responses', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {});

  describe('Microservice errors', () => {
    it('Requesting an entity with no permissions', async () => {
      const response = await app.get('entity/oracleages/YOLLS');

      // Forbidden error
      expect(response.statusCode).toEqual(403);
    });
  });
});
