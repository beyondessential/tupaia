/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import nodemailer from 'nodemailer';
import { getIsProductionEnvironment, requireEnv } from '@tupaia/utils';
import Mail from 'nodemailer/lib/mailer';

const DEFAULT_SIGN_OFF = 'Cheers,\n\nThe Tupaia Team';

type MailOptions = {
  subject?: string;
  text?: string;
  attachments?: Mail.Attachment[];
  signOff?: string;
};

export const sendEmail = async (to: string | string[], mailOptions: MailOptions = {}) => {
  const { subject, text, attachments, signOff = DEFAULT_SIGN_OFF } = mailOptions;
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
  const sendTo = getIsProductionEnvironment() ? to : (requireEnv('DEV_EMAIL_ADDRESS') as string);

  return transporter.sendMail({
    from: SITE_EMAIL_ADDRESS,
    to: sendTo,
    subject,
    attachments,
    text: `${text}\n${signOff}`,
  });
};
