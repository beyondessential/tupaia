/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { RateLimiterPostgres } from 'rate-limiter-flexible';
import { respond } from '@tupaia/utils';

const MAX_CONSECUTIVE_FAILS_BY_USERNAME = 5;
const MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY = 100;
/**
 * Singleton instance of RateLimiterPostgres
 */
let maxConsecutiveFailsRateLimiter = null;
let slowBruteForceRateLimiter = null;

export class TupaiaRateLimiter {
  constructor(knexInstance) {
    if (!maxConsecutiveFailsRateLimiter) {
      maxConsecutiveFailsRateLimiter = new RateLimiterPostgres({
        tableCreated: true,
        tableName: 'login_attempts',
        storeClient: knexInstance,
        storeType: `knex`,
        keyPrefix: 'login_fail_consecutive_username',
        points: MAX_CONSECUTIVE_FAILS_BY_USERNAME,
        duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
        blockDuration: 60 * 15, // Block for 15 minutes
      });
    }

    if (!slowBruteForceRateLimiter) {
      slowBruteForceRateLimiter = new RateLimiterPostgres({
        tableCreated: true,
        tableName: 'login_attempts',
        storeClient: knexInstance,
        storeType: `knex`,
        keyPrefix: 'login_fail_ip_per_day',
        points: MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY,
        duration: 60 * 60 * 24,
        blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
      });
    }

    this.maxConsecutiveFailsRateLimiter = maxConsecutiveFailsRateLimiter;
    this.slowBruteForceRateLimiter = slowBruteForceRateLimiter;
  }

  getUsernameIPkey(req) {
    const { ip, body } = req;
    return `${body.emailAddress}_${ip}`;
  }

  getIPkey(req) {
    return req.ip;
  }

  async checkIsRateLimited(req) {
    const maxConsecutiveFailsResponder = await this.maxConsecutiveFailsRateLimiter.get(
      this.getUsernameIPkey(req),
    );
    if (
      maxConsecutiveFailsResponder !== null &&
      maxConsecutiveFailsResponder.consumedPoints >= MAX_CONSECUTIVE_FAILS_BY_USERNAME
    ) {
      return true;
    }

    const slowBruteForceResponder = await this.slowBruteForceRateLimiter.get(this.getIPkey(req));

    if (
      slowBruteForceResponder !== null &&
      slowBruteForceResponder.consumedPoints >= MAX_CONSECUTIVE_FAILS_BY_USERNAME
    ) {
      return true;
    }

    return false;
  }

  async getRetryAfter(req) {
    const maxConsecutiveFailsResponder = await this.maxConsecutiveFailsRateLimiter.get(
      this.getUsernameIPkey(req),
    );
    const slowBruteForceResponder = await this.slowBruteForceRateLimiter.get(this.getIPkey(req));
    return Math.max(
      maxConsecutiveFailsResponder.msBeforeNext || 0,
      slowBruteForceResponder.msBeforeNext || 0,
    );
  }
  async addMaxConsecutiveFailedAttempt(req) {
    try {
      await this.maxConsecutiveFailsRateLimiter.consume(this.getUsernameIPkey(req));
    } catch (rlRejected) {
      // Swallow new error, log the original
    }
  }

  async addSlowBruteForceFailedAttempt(req) {
    try {
      await this.slowBruteForceRateLimiter.consume(this.getIPkey(req));
    } catch (rlRejected) {
      // Swallow new error, log the original
    }
  }

  async resetFailedAttempts(req) {
    await this.maxConsecutiveFailsRateLimiter.delete(this.getUsernameIPkey(req));
    await this.slowBruteForceRateLimiter.delete(this.getIPkey(req));
  }

  async respondToRateLimitedUser(req, res) {
    const msBeforeNext = await this.getRetryAfter(req);
    const retrySecs = Math.round(msBeforeNext / 1000) || 1;
    const retryMins = Math.round(retrySecs / 60) || 1;
    res.set('Retry-After', retrySecs);
    return respond(res, { error: `Too Many Requests. Retry in ${retryMins} min(s)` }, 429);
  }
}
