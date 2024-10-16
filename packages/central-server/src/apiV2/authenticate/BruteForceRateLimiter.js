/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { RateLimiterPostgres } from 'rate-limiter-flexible';

// Limit the number of wrong attempts per day per IP to 100 for the unit tests
const MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY = 100;

/**
 * Singleton instances of RateLimiterPostgres
 */
let postgresRateLimiter = null;

/**
 * Rate limiter which limits the number of wrong attempts per day per IP
 */
export class BruteForceRateLimiter {
  constructor(database) {
    if (!postgresRateLimiter) {
      postgresRateLimiter = new RateLimiterPostgres({
        tableCreated: true,
        tableName: 'login_attempts',
        storeClient: database.connection,
        storeType: 'knex',
        keyPrefix: 'login_fail_ip_per_day',
        points: this.getMaxAttempts(),
        duration: 60 * 60 * 24,
        blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
      });
    }
    // Reset the points with getMaxAttempts for test mocking
    postgresRateLimiter.points = this.getMaxAttempts();
    this.postgresRateLimiter = postgresRateLimiter;
  }

  /**
   * Get the maximum number of failed attempts allowed per day. Useful for testing.
   * @returns {number}
   */
  getMaxAttempts() {
    return MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY;
  }

  /**
   * Generate a key for the postgresRateLimiter based on the ip
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
    const slowBruteForceResponder = await this.postgresRateLimiter.get(this.getIPkey(req));
    return (
      slowBruteForceResponder !== null &&
      slowBruteForceResponder.consumedPoints >= this.getMaxAttempts()
    );
  }

  /**
   * Get the time until the user can retry.
   * @returns {Promise<number>}  Returns a number in milliseconds
   */
  async getRetryAfter(req) {
    try {
      await this.postgresRateLimiter.consume(this.getIPkey(req));
    } catch (rlRejected) {
      return rlRejected.msBeforeNext;
    }
  }

  /**
   * Add a failed attempt to the rate limiter login_attempts table
   */
  async addFailedAttempt(req) {
    try {
      // Add a failed attempt to the rate limiter. Gets stored in the login_attempts table
      await this.postgresRateLimiter.consume(this.getIPkey(req));
    } catch (rlRejected) {
      // node-rate-limiter is designed to reject the promise when saving failed attempts
      // We swallow the error here and let the original error bubble up
    }
  }

  async resetFailedAttempts(req) {
    await this.postgresRateLimiter.delete(this.getIPkey(req));
  }
}
