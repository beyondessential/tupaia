/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { RateLimiterPostgres } from 'rate-limiter-flexible';
import { respond } from '@tupaia/utils';

const MAX_CONSECUTIVE_FAILS_BY_USERNAME = 5;

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
        points: MAX_CONSECUTIVE_FAILS_BY_USERNAME,
        duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
        blockDuration: 60 * 15, // Block for 15 minutes
      });
    }

    this.postgresRateLimiter = postgresRateLimiter;
  }

  /**
   * Generate a key for the postgresRateLimiter based on the username and ip
   * @returns {string}
   */
  getUsernameIPkey(req) {
    const { ip, body } = req;
    return `${body.emailAddress}_${ip}`;
  }

  /**
   * Check if the user is rate limited
   * @returns {Promise<boolean>}
   */
  async checkIsRateLimited(req) {
    const maxConsecutiveFailsResponder = await this.postgresRateLimiter.get(
      this.getUsernameIPkey(req),
    );
    return (
      maxConsecutiveFailsResponder !== null &&
      maxConsecutiveFailsResponder.consumedPoints >= MAX_CONSECUTIVE_FAILS_BY_USERNAME
    );
  }

  /**
   * Get the time until the user can retry.
   * @returns {Promise<number>}  Returns a number in milliseconds
   */
  async getRetryAfter(req) {
    try {
      await this.postgresRateLimiter.consume(this.getUsernameIPkey(req));
    } catch (rlRejected) {
      return rlRejected.msBeforeNext;
    }
  }

  async addFailedAttempt(req) {
    try {
      // Add a failed attempt to the rate limiter. Gets stored in the login_attempts table
      await this.postgresRateLimiter.consume(this.getUsernameIPkey(req));
    } catch (rlRejected) {
      // node-rate-limiter is designed to reject the promise when saving failed attempts
      // We swallow the error here and let the original error bubble up
    }
  }

  async resetFailedAttempts(req) {
    await this.postgresRateLimiter.delete(this.getUsernameIPkey(req));
  }
}
