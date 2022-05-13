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

  describe('/auth (login)', () => {
    it('can authenticate a user', async () => {
      const response = await app.post('auth', {
        body: { fields: 'code,name,type' },
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toMatch(/Internal server error: .* is a required field/);
    });
  });

  describe('/auth?grantType=refresh_token (re-authenticate)', () => {
    it('returns 500 if no refreshToken provided', async () => {
      const response = await app.post('auth', {
        body: { fields: 'code,name,type' },
        query: { grantType: 'refresh_token' },
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toEqual(
        'Internal server error: refreshToken is a required field',
      );
    });
  });
});
