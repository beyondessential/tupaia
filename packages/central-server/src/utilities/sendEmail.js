/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import nodemailer from 'nodemailer';
import { getIsProductionEnvironment } from '@tupaia/utils';

const DEFAULT_SIGN_OFF = 'Cheers,\n\nThe Tupaia Team';

export const sendEmail = async (to, subject, text, attachments, signOff = DEFAULT_SIGN_OFF) => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SITE_EMAIL_ADDRESS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SITE_EMAIL_ADDRESS) {
    return {};
  }

  const transporter = nodemailer.createTransport({
    port: 465,
    host: SMTP_HOST,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  // Make sure it doesn't send real users mail from the dev server
  if (!getIsProductionEnvironment()) {
    to = process.env.DEV_EMAIL_ADDRESS;
  }

  return transporter.sendMail({
    from: SITE_EMAIL_ADDRESS,
    to,
    subject,
    attachments,
    text: `${text}\n${signOff}`,
  });
};
