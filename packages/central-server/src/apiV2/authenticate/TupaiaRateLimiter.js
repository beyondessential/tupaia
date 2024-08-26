/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { RateLimiterPostgres } from 'rate-limiter-flexible';
import { respond } from '@tupaia/utils';

const MAX_CONSECUTIVE_FAILS_BY_USERNAME = 5;

// Limit the number of wrong attempts per day per IP to 10 for the unit tests
const MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY = process.env.NODE_ENV === 'test' ? 100 : 10;

/**
 * Singleton instances of RateLimiterPostgres
 */
let maxConsecutiveFailsRateLimiter = null;
let slowBruteForceRateLimiter = null;

/**
 * Rate limiter for login attempts
 * Uses rate-limiter-flexible to limit the number of login attempts with two different strategies:
 * 1. Limit the number of consecutive failed attempts by username
 * 2. Limit the number of wrong attempts per day per IP
 *
 * Note: The rate limiter uses a Postgres database to store the login attempts in the login_attempts table
 */
export class TupaiaRateLimiter {
  constructor(knexInstance) {
    if (!maxConsecutiveFailsRateLimiter) {
      maxConsecutiveFailsRateLimiter = new RateLimiterPostgres({
        tableCreated: true,
        tableName: 'login_attempts',
        storeClient: knexInstance,
        storeType: 'knex',
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
        storeType: 'knex',
        keyPrefix: 'login_fail_ip_per_day',
        points: MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY,
        duration: 60 * 60 * 24,
        blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
      });
    }

    this.maxConsecutiveFailsRateLimiter = maxConsecutiveFailsRateLimiter;
    this.slowBruteForceRateLimiter = slowBruteForceRateLimiter;
  }

  /**
   * Generate a key for the maxConsecutiveFailsRateLimiter based on the username and ip
   * @returns {string}
   */
  getUsernameIPkey(req) {
    const { ip, body } = req;
    return `${body.emailAddress}_${ip}`;
  }

  /**
   * Generate a key for the slowBruteForceRateLimiter based on the ip
   * @returns {string}
   */
  getIPkey(req) {
    return req.ip;
  }

  /**
   * Check if the user is rate limited
   * @returns {Promise<boolean>}
   */
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
      slowBruteForceResponder.consumedPoints >= MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get the time until the user can retry.
   * @returns {Promise<number>}  Returns a number in milliseconds
   */
  async getRetryAfter(req) {
    try {
      await this.maxConsecutiveFailsRateLimiter.consume(this.getUsernameIPkey(req));
      await this.slowBruteForceRateLimiter.consume(this.getIPkey(req));
    } catch (rlRejected) {
      return rlRejected.msBeforeNext;
    }
  }

  async addMaxConsecutiveFailedAttempt(req) {
    try {
      // Add a failed attempt to the rate limiter. Gets stored in the login_attempts table
      await this.maxConsecutiveFailsRateLimiter.consume(this.getUsernameIPkey(req));
    } catch (rlRejected) {
      // node-rate-limiter is designed to reject the promise when saving failed attempts
      // We swallow the error here and let the original error bubble up
    }
  }

  /**
   * Add a failed attempt to the rate limiter login_attempts table
   */
  async addSlowBruteForceFailedAttempt(req) {
    try {
      // Add a failed attempt to the rate limiter. Gets stored in the login_attempts table
      await this.slowBruteForceRateLimiter.consume(this.getIPkey(req));
    } catch (rlRejected) {
      // node-rate-limiter is designed to reject the promise when saving failed attempts
      // We swallow the error here and let the original error bubble up
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
