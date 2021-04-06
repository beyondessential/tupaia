/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getUserAndPassFromBasicAuth } from '../userAuth';

describe('userAuth', () => {
  const createBasicHeader = (username, password) =>
    `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  describe('getUserAndPassFromBasicAuth', () => {
    it('returns username and password for basic auth header', async () => {
      const username = 'user';
      const password = 'pass';

      return expect(getUserAndPassFromBasicAuth(createBasicHeader(username, password))).toEqual({
        username,
        password,
      });
    });

    it('can handle password with special chars (including ":")', async () => {
      const username = 'user';
      const trickyPassword = 'P@$$":w$%^@#*d';

      return expect(
        getUserAndPassFromBasicAuth(createBasicHeader(username, trickyPassword)),
      ).toEqual({
        username,
        password: trickyPassword,
      });
    });

    it('Rejects auth header missing the "Basic " at the start', async () => {
      const username = 'user';
      const password = 'pass';

      return expect(() =>
        getUserAndPassFromBasicAuth(Buffer.from(`${username}:${password}`).toString('base64')),
      ).toThrow('Invalid Basic auth credentials');
    });

    it('Rejects invalid auth header', async () => {
      const username = 'user';
      const password = 'pass';

      return expect(() => getUserAndPassFromBasicAuth(`Basic ${username} ${password}`)).toThrow(
        'Invalid Basic auth credentials',
      );
    });
  });
});
