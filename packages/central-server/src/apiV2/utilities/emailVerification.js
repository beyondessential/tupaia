import { encryptPassword, verifyPassword } from '@tupaia/auth';
import { sendEmail } from '@tupaia/server-utils';
import { requireEnv } from '@tupaia/utils';

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

const getEmailVerificationToken = user => `${user.email}${user.password_hash}`;

export const sendEmailVerification = async user => {
  const token = await encryptPassword(getEmailVerificationToken(user));
  const platform = user.primary_platform ? user.primary_platform : 'tupaia';
  const { subject, signOff, platformName } = EMAILS[platform];

  const origin = ORIGINS[platform];
  const fullUrl = `${origin}/verify-email?verifyEmailToken=${encodeURIComponent(token)}`;

  return sendEmail(user.email, {
    subject,
    signOff,
    templateName: 'verifyEmail',
    templateContext: {
      title: 'Verify your email address',
      platform: platformName,
      cta: {
        text: 'Verify email',
        url: fullUrl,
      },
    },
  });
};

export const verifyEmailHelper = async (models, searchCondition, token) => {
  const users = await models.user.find({
    verified_email: searchCondition,
  });

  for (const user of users) {
    const verified = await verifyPassword(getEmailVerificationToken(user), token);

    if (verified) {
      return user;
    }
  }
  return null;
};
