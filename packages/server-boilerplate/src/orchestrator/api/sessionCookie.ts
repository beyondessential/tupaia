import sessions from 'client-sessions';

// session lasts 14 days, but will be extended by a further 7 if you use it
// and there are less than 7 days before expiry
const DAYS = 24 * 60 * 60 * 1000;
const INITIAL_EXPIRY = 14 * DAYS;
const EXTENSION_ON_USE = 7 * DAYS;
const SESSION_COOKIE_CONFIG = {
  cookieName: 'sessionCookie',
  secret: process.env.SESSION_COOKIE_SECRET || 'localCookieSecret123',
  duration: INITIAL_EXPIRY,
  activeDuration: EXTENSION_ON_USE,
};

export const sessionCookie = () => sessions(SESSION_COOKIE_CONFIG);
