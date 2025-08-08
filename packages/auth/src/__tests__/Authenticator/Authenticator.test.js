import randomToken from 'rand-token';
import { refreshToken } from './Authenticator.fixtures';
import { testAuthenticatePassword } from './testAuthenticatePassword';
import { testAuthenticateOneTimeLogin } from './testAuthenticateOneTimeLogin';
import { testAuthenticateRefreshToken } from './testAuthenticateRefreshToken';

jest.mock('rand-token');
randomToken.generate.mockReturnValue(refreshToken);

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
