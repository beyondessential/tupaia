/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { RateLimiterPostgres } from 'rate-limiter-flexible';

const MAX_CONSECUTIVE_FAILS_BY_USERNAME = 10;

/**
 * Singleton instances of RateLimiterPostgres
 */
let postgresRateLimiter = null;

/**
 * Rate limiter which limits the number of consecutive failed attempts by username
 */
export class ConsecutiveFailsRateLimiter {
  constructor(database) {
    if (!postgresRateLimiter) {
      postgresRateLimiter = new RateLimiterPostgres({
        tableCreated: true,
        tableName: 'login_attempts',
        storeClient: database.connection,
        storeType: 'knex',
        keyPrefix: 'login_fail_consecutive_username',
        points: this.getMaxAttempts(),
        duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
        blockDuration: 60 * 15, // Block for 15 minutes
      });
    }
    // Reset the points with getMaxAttempts for test mocking
    postgresRateLimiter.points = this.getMaxAttempts();
    this.postgresRateLimiter = postgresRateLimiter;
  }

  /**
   * Get the maximum number of consecutive failed attempts allowed. Useful for testing.
   * @returns {number}
   */
  getMaxAttempts() {
    return MAX_CONSECUTIVE_FAILS_BY_USERNAME;
  }

  /**
   * Generate a key for the postgresRateLimiter based on the username
   * @returns {string}
   */
  getUsernameKey(req) {
    const { body } = req;
    return body.emailAddress;
  }

  /**
   * Check if the user is rate limited
   * @returns {Promise<boolean>}
   */
  async checkIsRateLimited(req) {
    const maxConsecutiveFailsResponder = await this.postgresRateLimiter.get(
      this.getUsernameKey(req),
    );
    return (
      maxConsecutiveFailsResponder !== null &&
      maxConsecutiveFailsResponder.consumedPoints >= this.getMaxAttempts()
    );
  }

  /**
   * Get the time until the user can retry.
   * @returns {Promise<number>}  Returns a number in milliseconds
   */
  async getRetryAfter(req) {
    try {
      await this.postgresRateLimiter.consume(this.getUsernameKey(req));
    } catch (rlRejected) {
      return rlRejected.msBeforeNext;
    }
  }

  async addFailedAttempt(req) {
    try {
      // Add a failed attempt to the rate limiter. Gets stored in the login_attempts table
      await this.postgresRateLimiter.consume(this.getUsernameKey(req));
    } catch (rlRejected) {
      // node-rate-limiter is designed to reject the promise when saving failed attempts
      // We swallow the error here and let the original error bubble up
    }
  }

  async resetFailedAttempts(req) {
    await this.postgresRateLimiter.delete(this.getUsernameKey(req));
  }
}
