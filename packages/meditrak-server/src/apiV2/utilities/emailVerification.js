/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { encryptPassword } from '@tupaia/auth';
import { sendEmail } from '../../utilities';

const EMAIL_CONTENTS = {
  tupaia: {
    subject: 'Tupaia email verification',
    body: resetUrl =>
      'Thank you for registering with tupaia.org.\n' +
      'Please click on the following link to register your email address.\n\n' +
      `${resetUrl}\n\n` +
      'If you believe this email was sent to you in error, please contact us immediately at admin@tupaia.org.\n',
  },
  lesmis: {
    subject: 'LESMIS email verification',
    body: resetUrl =>
      'Thank you for registering with lesmis.la\n' +
      'Please click on the following link to register your email address\n\n' +
      `${resetUrl}\n\n` +
      'If you believe this email was sent to you in error, please contact us immediately at admin@tupaia.org.\n',
    signOff: 'Best regards,\nThe LESMIS Team',
  },
};

// Todo: generate from req.hostname
const VERIFY_URL = process.env.VERIFY_EMAIL_URL;

export const sendEmailVerification = async (user, verifyUrl = VERIFY_URL) => {
  const verifyHash = encryptPassword(user.email + user.password_hash, user.password_salt);
  const resetUrl = verifyUrl.replace('{token}', verifyHash);
  const platform = user.primary_platform ? user.primary_platform : 'tupaia';

  const { subject, body, signOff } = EMAIL_CONTENTS[platform];

  return sendEmail(user.email, subject, body(resetUrl), null, signOff);
};

export const verifyEmailHelper = async (models, searchCondition, token) => {
  const users = await models.user.find({
    verified_email: searchCondition,
  });

  return users.find(x => encryptPassword(x.email + x.password_hash, x.password_salt) === token);
};
