/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { encryptPassword, verifyPassword } from '@tupaia/auth';
import { sendEmail } from '@tupaia/server-utils';
import { requireEnv } from '@tupaia/utils';

const EMAILS = {
  tupaia: {
    subject: 'Tupaia email verification',
    body: (token, url) =>
      'Thank you for registering with tupaia.org.\n' +
      'Please click on the following link to register your email address.\n\n' +
      `${url}/verify-email?verifyEmailToken=${token}\n\n` +
      'If you believe this email was sent to you in error, please contact us immediately at admin@tupaia.org.\n',
  },
  datatrak: {
    subject: 'Tupaia Datatrak email verification',
    body: (token, url) =>
      'Thank you for registering with datatrak.tupaia.org.\n' +
      'Please click on the following link to register your email address.\n\n' +
      `${url}/verify-email?verifyEmailToken=${token}\n\n` +
      'If you believe this email was sent to you in error, please contact us immediately at admin@tupaia.org.\n',
  },
  lesmis: {
    subject: 'LESMIS email verification',
    body: (token, url) =>
      'Thank you for registering with lesmis.la.\n' +
      'Please click on the following link to register your email address.\n\n' +
      `${url}/en/verify-email?verifyEmailToken=${token}\n\n` +
      'If you believe this email was sent to you in error, please contact us immediately at admin@tupaia.org.\n',
    signOff: 'Best regards,\nThe LESMIS Team',
  },
};

export const sendEmailVerification = async user => {
  const token = await encryptPassword(`${user.email}${user.password_hash}`, user.password_salt);
  const platform = user.primary_platform ? user.primary_platform : 'tupaia';
  const { subject, body, signOff } = EMAILS[platform];
  const TUPAIA_FRONT_END_URL = requireEnv('TUPAIA_FRONT_END_URL');
  const LESMIS_FRONT_END_URL = requireEnv('LESMIS_FRONT_END_URL');
  const DATATRAK_FRONT_END_URL = requireEnv('DATATRAK_FRONT_END_URL');

  const url = {
    tupaia: TUPAIA_FRONT_END_URL,
    datatrak: DATATRAK_FRONT_END_URL,
    lesmis: LESMIS_FRONT_END_URL,
  }[platform];

  return sendEmail(user.email, { subject, text: body(token, url), signOff });
};

export const verifyEmailHelper = async (models, searchCondition, token) => {
  const users = await models.user.find({
    verified_email: searchCondition,
  });

  for (const user of users) {
    const verified = await verifyPassword(
      `${user.email}${user.password_hash}`,
      user.password_salt,
      token,
    );

    if (verified) {
      return user;
    }
  }
  return null;
};
