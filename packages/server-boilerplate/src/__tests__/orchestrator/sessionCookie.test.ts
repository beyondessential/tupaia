import sessions from 'client-sessions';

import { sessionCookie } from '../../orchestrator/api/sessionCookie';

jest.mock('client-sessions', () => jest.fn(() => 'sessionCookieMiddleware'));

describe('sessionCookie', () => {
  const originalSecret = process.env.SESSION_COOKIE_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.SESSION_COOKIE_SECRET;
    } else {
      process.env.SESSION_COOKIE_SECRET = originalSecret;
    }
  });

  it('uses SESSION_COOKIE_SECRET as set when called, not when the module was loaded', () => {
    // Servers import this module before loading their .env files
    process.env.SESSION_COOKIE_SECRET = 'secret-loaded-after-import';

    expect(sessionCookie()).toBe('sessionCookieMiddleware');
    expect(sessions).toHaveBeenCalledTimes(1);
    expect(sessions).toHaveBeenCalledWith(
      expect.objectContaining({
        cookieName: 'sessionCookie',
        secret: 'secret-loaded-after-import',
      }),
    );
  });

  it('throws rather than falling back to a default secret when SESSION_COOKIE_SECRET is unset', () => {
    delete process.env.SESSION_COOKIE_SECRET;

    expect(() => sessionCookie()).toThrow('SESSION_COOKIE_SECRET');
    expect(sessions).not.toHaveBeenCalled();
  });
});
