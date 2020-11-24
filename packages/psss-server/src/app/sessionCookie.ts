/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sessions from 'client-sessions';

const SESSION_COOKIE_TIMEOUT = 24 * 60 * 60 * 1000; // session lasts 24 hours
const SESSION_COOKIE_CONFIG = {
  cookieName: 'sessionCookie',
  secret: process.env.SESSION_COOKIE_SECRET || 'localCookieSecret123',
  duration: SESSION_COOKIE_TIMEOUT,
  activeDuration: SESSION_COOKIE_TIMEOUT,
};

export const sessionCookie = () => sessions(SESSION_COOKIE_CONFIG);
