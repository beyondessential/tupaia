/**
 * @typedef {import('@tupaia/database').ComparisonType} ComparisonType
 * @typedef {import('@tupaia/database').UserRecord} UserRecord
 * @typedef {import('@tupaia/types').UserAccount} UserAccount
 * @typedef {import('@tupaia/types').VerifiedEmail} VerifiedEmail
 */

import { encryptPassword, sha256EncryptPassword as sha256, verifyPassword } from '@tupaia/auth';
import { sendEmail } from '@tupaia/server-utils';
import { PrimaryPlatform } from '@tupaia/types';
import { requireEnv } from '@tupaia/utils';
import winston from '../../log';

const EMAILS = /** @type {const} */ ({
  tupaia: {
    subject: 'Tupaia email verification',
    platformName: 'tupaia.org',
  },
  datatrak: {
    subject: 'Tupaia DataTrak email verification',
    platformName: 'datatrak.tupaia.org',
  },
  lesmis: {
    subject: 'LESMIS email verification',
    signOff: 'Best regards,\nThe LESMIS Team',
    platformName: 'lesmis.la',
  },
});

/** @type {Record<PrimaryPlatform, string>} */
const ORIGINS = {
  tupaia: requireEnv('TUPAIA_FRONT_END_URL'),
  lesmis: requireEnv('LESMIS_FRONT_END_URL'),
  datatrak: requireEnv('DATATRAK_FRONT_END_URL'),
};

/** @satisfies {Partial<Record<PrimaryPlatform, `/${string}`>> & { default: `/${string}` }} */
const PATHNAMES = /** @type {const} */ ({
  default: '/verify-email',
  lesmis: '/en/verify-email',
});

/** @param {Pick<UserAccount, 'email' | 'password_hash'>} user */
const getEmailVerificationToken = user => `${user.email}${user.password_hash}`;

/** @param {UserAccount} user */
const generateVerificationLink = async user => {
  const token = await encryptPassword(getEmailVerificationToken(user));

  const platform = user.primary_platform || 'tupaia';
  const origin = ORIGINS[platform];
  const pathname = PATHNAMES[platform] ?? PATHNAMES.default;
  try {
    const url = new URL(pathname, origin);
    url.searchParams.set('verifyEmailToken', token);
    return url.toString();
  } catch (e) {
    winston.error(`Couldn’t create email verification link. Is ‘${origin}’ a valid URL origin?`);
    throw e;
  }
};

/** @param {UserAccount} */
export const sendEmailVerification = async user => {
  const platform = user.primary_platform || 'tupaia';
  const { subject, signOff, platformName } = EMAILS[platform];
  const url = await generateVerificationLink(user);

  return await sendEmail(user.email, {
    subject,
    signOff,
    templateName: 'verifyEmail',
    templateContext: {
      title: 'Verify your email address',
      platform: platformName,
      cta: {
        text: 'Verify email',
        url,
      },
    },
  });
};

/**
 * Verification tokens prior to our adoption of Argon2 were generated with
 * {@link sha256}.
 * @param {string} token
 */
const isLegacyToken = token => /^[0-9a-f]{64}$/.test(token);

/**
 * @param {*} models
 * @param {VerifiedEmail | VerifiedEmail[] | {
 *   comparisonType?: ComparisonType;
 *   comparator: string;
 *   comparisonValue: VerifiedEmail | VerifiedEmail[];
 * }} searchCondition
 * @param {string} token
 * @returns {Promise<?UserAccount['id']>}
 * @throws {VerificationTokenExpiredError}
 * @throws {VerificationTokenInvalidError}
 */
export const verifyEmailHelper = async (models, searchCondition, token) => {
  if (isLegacyToken(token)) {
    // Token generated prior to adoption of Argon2. Report to end user as “expired”.
    throw new VerificationTokenExpiredError(
      'Email verification link expired. Please request a new one.',
    );
  }

  if (!token.startsWith('$argon2id$')) throw new VerificationTokenInvalidError();

  /** @type {UserRecord[]} */
  const users = await models.user.find(
    { verified_email: searchCondition },
    {
      columns: ['email', 'id', 'password_hash'],
      // Demote stale unverified accounts. (Hacky heuristic to deal with the performance of
      // iterating through every user from this query.)
      sort: ['creation_date DESC'],
    },
  );

  try {
    for (const user of users) {
      const verified = await verifyPassword(getEmailVerificationToken(user), token);
      if (verified) return user.id;
    }
  } catch (e) {
    if (e.code === 'InvalidArg') throw new VerificationTokenInvalidError();
    throw e;
  }

  return null;
};

export class VerificationTokenExpiredError extends Error {
  /** @param {string} [message] */
  constructor(message) {
    super(message);
    this.name = 'VerificationTokenExpiredError';
  }
}

export class VerificationTokenInvalidError extends Error {
  /** @param {string} [message] */
  constructor(message) {
    super(message);
    this.name = 'VerificationTokenInvalidError';
  }
}
