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
randomToken.generate.mockReturnValue(refreshToken);

jest.mock('../../utils', () => ({
  checkPassword: password => {
    return password === 'validPassword';
  },
}));

describe('Authenticator', () => {
  describe('authenticatePassword', testAuthenticatePassword);

  describe('authenticateRefreshToken', testAuthenticateRefreshToken);

  describe('authenticateOneTimeLogin', testAuthenticateOneTimeLogin);
});
