import { encryptPassword, sha256EncryptPassword as sha256, verifyPassword } from '@tupaia/auth';
import { sendEmail } from '@tupaia/server-utils';
import { requireEnv } from '@tupaia/utils';
import winston from '../../log';

const EMAILS = {
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
};

const ORIGINS = {
  tupaia: requireEnv('TUPAIA_FRONT_END_URL'),
  lesmis: requireEnv('LESMIS_FRONT_END_URL'),
  datatrak: requireEnv('DATATRAK_FRONT_END_URL'),
};

const PATHNAMES = {
  default: '/verify-email',
  lesmis: '/en/verify-email',
};

const getEmailVerificationToken = user => `${user.email}${user.password_hash}`;

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

export const sendEmailVerification = async user => {
  const platform = user.primary_platform || 'tupaia';
  const { subject, signOff, platformName } = EMAILS[platform];
  const url = await generateVerificationLink(user);

  return sendEmail(user.email, {
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
 */
const isLegacyToken = token => /^[0-9a-f]{64}$/.test(token);

export const verifyEmailHelper = async (models, searchCondition, token) => {
  if (isLegacyToken(token)) {
    // Token generated prior to adoption of Argon2. Report to end user as “expired”.
    throw new VerificationTokenExpiredError(
      'Email verification link expired. Please request a new one.',
    );
  }

  if (!token.startsWith('$argon2id$')) throw new VerificationTokenInvalidError();

  const users = await models.user.find({ verified_email: searchCondition });

  try {
    for (const user of users) {
      const verified = await verifyPassword(getEmailVerificationToken(user), token);
      if (verified) return user;
    }
  } catch (e) {
    if (e.code === 'InvalidArg') throw new VerificationTokenInvalidError();
    throw e;
  }

  return null;
};

export class VerificationTokenExpiredError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VerificationTokenExpiredError';
  }
}

export class VerificationTokenInvalidError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VerificationTokenInvalidError';
  }
}
