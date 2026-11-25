import sessions from 'client-sessions';

import { requireEnv } from '@tupaia/utils';

const DAYS = 24 * 60 * 60 * 1000;
const duration = 14 * DAYS;
const activeDuration = 7 * DAYS;

export const sessionCookie = () =>
  sessions({
    cookieName: 'sessionCookie',
    secret: requireEnv('SESSION_COOKIE_SECRET'),
    duration,
    activeDuration,
  });
