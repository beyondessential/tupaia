/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import randomToken from 'rand-token';
import { refreshToken } from './Authenticator.fixtures';
import { testAuthenticatePassword } from './testAuthenticatePassword';
import { testAuthenticateOneTimeLogin } from './testAuthenticateOneTimeLogin';
import { testAuthenticateRefreshToken } from './testAuthenticateRefreshToken';

jest.mock('rand-token');

describe('Authenticator', () => {
  beforeAll(() => {
    // sinon.stub(randomToken, 'generate').returns(refreshToken);
    randomToken.generate.mockReturnValue(refreshToken);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('authenticatePassword', testAuthenticatePassword);
  describe('authenticateRefreshToken', testAuthenticateRefreshToken);
  describe('authenticateOneTimeLogin', testAuthenticateOneTimeLogin);
});
