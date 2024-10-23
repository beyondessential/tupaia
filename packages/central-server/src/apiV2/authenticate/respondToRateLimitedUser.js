/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { respond } from '@tupaia/utils';

export async function respondToRateLimitedUser(msBeforeNext, res) {
  const retrySecs = Math.round(msBeforeNext / 1000) || 1;
  const retryMins = Math.round(retrySecs / 60) || 1;
  res.set('Retry-After', retrySecs);
  return respond(res, { error: `Too Many Requests. Retry in ${retryMins} min(s)` }, 429);
}
