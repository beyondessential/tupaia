import jwt from 'jsonwebtoken';

import { createBasicHeader, createBearerHeader, requireEnv } from '@tupaia/utils';

import {
  constructAccessToken,
  getTokenClaims,
  getTokenClaimsFromBearerAuth,
  getUserAndPassFromBasicAuth,
} from '../userAuth';

describe('userAuth', () => {
  describe('accessToken', () => {
    it('can construct access token', async () => {
      const userId = 'user1';

      return expect(constructAccessToken({ userId })).toBeString();
    });

    it('can construct access token with apiClientId', async () => {
      const userId = 'user1';
      const apiClientUserId = 'apiClient1';

      return expect(constructAccessToken({ userId, apiClientUserId })).toBeString();
    });

    it('throws error when constructing access token without userId', async () => {
      const apiClientUserId = 'apiClient1';

      return expect(() => constructAccessToken({ apiClientUserId })).toThrow(
        'Cannot construct accessToken: missing userId',
      );
    });

    it('can decrypt access token claims', async () => {
      const userId = 'user1';
      const apiClientUserId = 'apiClient1';

      const accessToken = constructAccessToken({ userId, apiClientUserId });
      const authHeader = createBearerHeader(accessToken);
      const { userId: decryptedUserId, apiClientUserId: decryptedApiClientUserId } =
        getTokenClaimsFromBearerAuth(authHeader);

      return expect({
        userId: decryptedUserId,
        apiClientUserId: decryptedApiClientUserId,
      }).toEqual({
        userId,
        apiClientUserId,
      });
    });

    it('throws error when decrypting expired token', async () => {
      const accessToken = jwt.sign({ test: 'test' }, requireEnv('JWT_SECRET'), { expiresIn: 0 });
      const authHeader = createBearerHeader(accessToken);

      return expect(() => getTokenClaimsFromBearerAuth(authHeader)).toThrow(
        'Authorization token has expired. Please log in again.',
      );
    });

    it('throws 401 error when decrypting expired token', async () => {
      const accessToken = jwt.sign({ test: 'test' }, requireEnv('JWT_SECRET'), { expiresIn: 0 });

      return expect(() => getTokenClaims(accessToken)).toThrow(
        expect.objectContaining({ name: 'UnauthenticatedError', statusCode: 401 }),
      );
    });

    // e.g. a token issued before rotating JWT_SECRET
    it('throws 401 error when decrypting token signed with a different secret', async () => {
      const accessToken = jwt.sign({ userId: 'user1' }, `not-${requireEnv('JWT_SECRET')}`);

      return expect(() => getTokenClaims(accessToken)).toThrow(
        expect.objectContaining({
          name: 'UnauthenticatedError',
          message: 'Authorization token is invalid. Please log in again.',
          statusCode: 401,
        }),
      );
    });

    it('throws 401 error when decrypting malformed token', async () => {
      const authHeader = createBearerHeader('not-a-jwt');

      return expect(() => getTokenClaimsFromBearerAuth(authHeader)).toThrow(
        expect.objectContaining({
          name: 'UnauthenticatedError',
          message: 'Authorization token is invalid. Please log in again.',
          statusCode: 401,
        }),
      );
    });
  });

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
