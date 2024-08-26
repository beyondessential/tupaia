/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { RateLimiterPostgres } from 'rate-limiter-flexible';
import { respond } from '@tupaia/utils';

const MAX_CONSECUTIVE_FAILS_BY_USERNAME = 5;

/**
 * Singleton instance of RateLimiterPostgres
 */
let rateLimiterPostgres = null;

export class TupaiaRateLimiter {
  constructor(knexInstance) {
    if (!rateLimiterPostgres) {
      rateLimiterPostgres = new RateLimiterPostgres({
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
    this.rateLimiterPostgres = rateLimiterPostgres;
  }

  getKey(req) {
    return req.body.emailAddress;
  }

  async checkIsRateLimited(req) {
    const key = this.getKey(req);
    const responder = await this.rateLimiterPostgres.get(key);
    return responder !== null && responder.consumedPoints >= MAX_CONSECUTIVE_FAILS_BY_USERNAME;
  }

  async getRetryAfter(req) {
    const key = this.getKey(req);
    const responder = await this.rateLimiterPostgres.get(key);
    return Math.round(responder.msBeforeNext / 1000) || 1;
  }
  async addFailedAttempt(req) {
    try {
      await this.rateLimiterPostgres.consume(this.getKey(req));
    } catch (rlRejected) {
      // Swallow new error, log the original
    }
  }

  async resetFailedAttempts(req) {
    return this.rateLimiterPostgres.delete(this.getKey(req));
  }

  async respondToRateLimitedUser(req, res) {
    const retrySecs = await this.getRetryAfter(req);
    const retryMins = Math.round(retrySecs / 60) || 1;
    res.set('Retry-After', retrySecs);
    return respond(res, { error: `Too Many Requests. Retry in ${retryMins} min(s)` }, 429);
  }
}
//
// const maxWrongAttemptsByIPperDay = 100;
//
// export class SlowBruteByIPRateLimiter extends RateLimiterPostgres {
//   maxFails = maxWrongAttemptsByIPperDay;
//
//   constructor(knexInstance) {
//     super({
//       tableCreated: true,
//       tableName: 'login_attempts',
//       storeClient: knexInstance,
//       storeType: `knex`,
//       keyPrefix: 'login_fail_ip_per_day',
//       points: maxWrongAttemptsByIPperDay,
//       duration: 60 * 60 * 24,
//       blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
//     });
//   }
// }
//
// export const RateLimiter = null;
// export const getInstance = () => {
//   if (RateLimiter) {
//     return RateLimiter;
//   }
//   RateLimiter = new ConsecutiveFailsByUsernameAndIPRateLimiter();
// };
//
// export class ConsecutiveFailsByUsernameAndIPRateLimiter extends RateLimiterPostgres {
//   maxFails = maxConsecutiveFailsByUsername;
//   username = null;
//   constructor(knexInstance) {
//     super({
//       tableCreated: true,
//       tableName: 'login_attempts',
//       storeClient: knexInstance,
//       storeType: `knex`,
//       keyPrefix: 'login_fail_consecutive_username',
//       points: maxConsecutiveFailsByUsername,
//       duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
//       blockDuration: 60 * 15, // Block for 15 minutes
//     });
//   }
//
//   async init(username) {
//     this.username = username;
//     return await this.get(username);
//   }
//
//   isRateLimited() {
//     return this.RateLimiterRes?.consumedPoints > this.maxFails;
//   }
//
//   respondToRateLimitedUser(res) {
//     const retrySecs = Math.round(res.msBeforeNext / 1000) || 1;
//     const retryMins = Math.round(retrySecs / 60) || 1;
//     this.res.set('Retry-After', retrySecs);
//     return respond(res, { error: `Too Many Requests. Retry in ${retryMins} min(s)` }, 429);
//   }
//
//   async reset() {
//     if (this.RateLimiterRes?.consumedPoints > 0) {
//       await this.delete(this.username);
//     }
//   }
// }
