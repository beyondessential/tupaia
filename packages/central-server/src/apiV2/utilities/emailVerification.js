/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { encryptPassword } from '@tupaia/auth';
import { sendEmail } from '@tupaia/server-utils';
import { requireEnv } from '@tupaia/utils';

const EMAILS = {
  tupaia: {
    subject: 'Tupaia email verification',
    platformName: 'tupaia.org',
  },
  datatrak: {
    subject: 'Tupaia Datatrak email verification',
    platformName: 'datatrak.tupaia.org',
  },
  lesmis: {
    subject: 'LESMIS email verification',
    signOff: 'Best regards,\nThe LESMIS Team',
    platformName: 'lesmis.la',
  },
};

export const sendEmailVerification = async user => {
  const token = encryptPassword(user.email + user.password_hash, user.password_salt);
  const platform = user.primary_platform ? user.primary_platform : 'tupaia';
  const { subject, signOff, platformName } = EMAILS[platform];
  const TUPAIA_FRONT_END_URL = requireEnv('TUPAIA_FRONT_END_URL');
  const LESMIS_FRONT_END_URL = requireEnv('LESMIS_FRONT_END_URL');
  const DATATRAK_FRONT_END_URL = requireEnv('DATATRAK_FRONT_END_URL');

  const url = {
    tupaia: TUPAIA_FRONT_END_URL,
    datatrak: DATATRAK_FRONT_END_URL,
    lesmis: `${LESMIS_FRONT_END_URL}/en`,
  }[platform];

  const fullUrl = `${url}/verify-email?verifyEmailToken=${token}`;

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

  return users.find(x => encryptPassword(x.email + x.password_hash, x.password_salt) === token);
};
