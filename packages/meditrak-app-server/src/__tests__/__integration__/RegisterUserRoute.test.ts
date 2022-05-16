/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp } from '../utilities';

describe('auth', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  describe('/user (register user)', () => {
    it('it invokes registerUser() on the CentralApi', async () => {
      const userId = '1234';
      const user = { id: userId };
      const response = await app.post('user', {
        body: user,
      });

      expect(response.body).toEqual({ message: 'Successfully created user', id: userId });
    });
  });
});
