import { nanoid } from 'nanoid';
import { refreshToken } from './Authenticator.fixtures';
import { testAuthenticatePassword } from './testAuthenticatePassword';
import { testAuthenticateOneTimeLogin } from './testAuthenticateOneTimeLogin';
import { testAuthenticateRefreshToken } from './testAuthenticateRefreshToken';

jest.mock('nanoid');
nanoid.mockReturnValue(refreshToken);

beforeAll(() => {
  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date(2020, 3, 1));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Authenticator', () => {
  describe('authenticatePassword', testAuthenticatePassword);

  describe('authenticateRefreshToken', testAuthenticateRefreshToken);

  describe('authenticateOneTimeLogin', testAuthenticateOneTimeLogin);
});
