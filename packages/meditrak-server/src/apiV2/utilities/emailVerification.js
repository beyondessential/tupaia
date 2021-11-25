/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { encryptPassword } from '@tupaia/auth';
import { sendEmail } from '../../utilities';

const { TUPAIA_FRONT_END_URL, LESMIS_FRONT_END_URL } = process.env;

const EMAILS = {
  tupaia: {
    subject: 'Tupaia email verification',
    body: token =>
      'Thank you for registering with tupaia.org.\n' +
      'Please click on the following link to register your email address.\n\n' +
      `${TUPAIA_FRONT_END_URL}/verify-email?verifyEmailToken=${token}\n\n` +
      'If you believe this email was sent to you in error, please contact us immediately at admin@tupaia.org.\n',
  },
  lesmis: {
    subject: 'LESMIS email verification',
    body: token =>
      'Thank you for registering with lesmis.la.\n' +
      'Please click on the following link to register your email address.\n\n' +
      `${LESMIS_FRONT_END_URL}/en/verify-email?verifyEmailToken=${token}\n\n` +
      'If you believe this email was sent to you in error, please contact us immediately at admin@tupaia.org.\n',
    signOff: 'Best regards,\nThe LESMIS Team',
  },
};

export const sendEmailVerification = async user => {
  const token = encryptPassword(user.email + user.password_hash, user.password_salt);
  const platform = user.primary_platform ? user.primary_platform : 'tupaia';
  const { subject, body, signOff } = EMAILS[platform];

  return sendEmail(user.email, subject, body(token), null, signOff);
};

export const verifyEmailHelper = async (models, searchCondition, token) => {
  const users = await models.user.find({
    verified_email: searchCondition,
  });

  return users.find(x => encryptPassword(x.email + x.password_hash, x.password_salt) === token);
};
