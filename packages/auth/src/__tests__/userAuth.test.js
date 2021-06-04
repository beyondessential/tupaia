/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import jwt from 'jsonwebtoken';
import {
  getUserAndPassFromBasicAuth,
  getTokenClaimsFromBearerAuth,
  constructAccessToken,
} from '../userAuth';

describe('userAuth', () => {
  describe('accessToken', () => {
    it('can construct access token', async () => {
      const userId = 'user1';
      const refreshToken = 'refresh';

      return expect(constructAccessToken({ userId, refreshToken })).toBeString();
    });

    it('can construct access token with apiClientId', async () => {
      const userId = 'user1';
      const refreshToken = 'refresh';
      const apiClientUserId = 'apiClient1';

      return expect(constructAccessToken({ userId, refreshToken, apiClientUserId })).toBeString();
    });

    it('throws error when constructing access token without userId', async () => {
      const refreshToken = 'refresh';
      const apiClientUserId = 'apiClient1';

      return expect(() => constructAccessToken({ refreshToken, apiClientUserId })).toThrow(
        'Cannot construct accessToken: missing userId',
      );
    });

    it('throws error when constructing access token without refreshToken', async () => {
      const userId = 'user1';
      const apiClientUserId = 'apiClient1';

      return expect(() => constructAccessToken({ userId, apiClientUserId })).toThrow(
        'Cannot construct accessToken: missing refreshToken',
      );
    });

    it('can decrypt access token claims', async () => {
      const userId = 'user1';
      const refreshToken = 'refresh';
      const apiClientUserId = 'apiClient1';

      const accessToken = constructAccessToken({ userId, refreshToken, apiClientUserId });
      const authHeader = `Bearer ${accessToken}`;
      const {
        userId: decryptedUserId,
        refreshToken: decryptedRefreshToken,
        apiClientUserId: decryptedApiClientUserId,
      } = getTokenClaimsFromBearerAuth(authHeader);

      return expect({
        userId: decryptedUserId,
        refreshToken: decryptedRefreshToken,
        apiClientUserId: decryptedApiClientUserId,
      }).toEqual({
        userId,
        refreshToken,
        apiClientUserId,
      });
    });

    it('throws error when decrypting expired token', async () => {
      const accessToken = jwt.sign({ test: 'test' }, process.env.JWT_SECRET, {
        expiresIn: 0,
      });
      const authHeader = `Bearer ${accessToken}`;

      return expect(() => getTokenClaimsFromBearerAuth(authHeader)).toThrow(
        'Authorization token has expired, please log in again',
      );
    });
  });

  describe('getUserAndPassFromBasicAuth', () => {
    const createBasicHeader = (username, password) =>
      `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

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
