/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { MockCentralApi } from '@tupaia/api-client';
import { setupTestApp } from '../utilities';

const mockResponseMsg = 'Successfully created user';

describe('user', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp({
      central: new MockCentralApi(),
    });
  });

  describe('/user (register user)', () => {
    it('it invokes registerUser() on the CentralApi', async () => {
      const userId = '1234';
      const user = { id: userId };
      const response = await app.post('user', {
        body: user,
      });

      expect(response.body).toEqual({ message: mockResponseMsg, userId });
    });
  });
});
