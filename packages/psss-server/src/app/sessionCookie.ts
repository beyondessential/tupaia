/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import session from 'client-sessions';

const USER_SESSION_COOKIE_TIMEOUT = 24 * 60 * 60 * 1000; // session lasts 24 hours
const USER_SESSION_CONFIG = {
  cookieName: 'sessionCookie',
  secret: process.env.USER_SESSION_COOKIE_SECRET || '',
  secure: false,
  httpOnly: false,
  duration: USER_SESSION_COOKIE_TIMEOUT,
  activeDuration: USER_SESSION_COOKIE_TIMEOUT,
};

export const sessionCookie = () => session(USER_SESSION_CONFIG);
