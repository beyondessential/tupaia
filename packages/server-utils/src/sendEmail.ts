/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import nodemailer from 'nodemailer';
import { getIsProductionEnvironment, requireEnv } from '@tupaia/utils';
import Mail from 'nodemailer/lib/mailer';

const TEXT_SIGN_OFF = 'Cheers,\n\nThe Tupaia Team';
const HTML_SIGN_OFF = '<p>Cheers,<br><br>The Tupaia Team</p>';

type MailOptions = {
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Mail.Attachment[];
  signOff?: string;
};

export const sendEmail = async (to: string | string[], mailOptions: MailOptions = {}) => {
  const {
    subject,
    text,
    html,
    attachments,
    signOff = html ? HTML_SIGN_OFF : TEXT_SIGN_OFF,
  } = mailOptions;
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SITE_EMAIL_ADDRESS } = process.env;

  if (text && html) {
    throw new Error('Only text or html can be sent in an email, not both');
  }

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

  const fullText = text ? `${text}\n${signOff}` : undefined;
  const fullHtml = html ? `${html}<br>${signOff}` : undefined;

  return transporter.sendMail({
    from: `Tupaia <${SITE_EMAIL_ADDRESS}>`,
    sender: SITE_EMAIL_ADDRESS,
    to: sendTo,
    subject,
    attachments,
    text: fullText,
    html: fullHtml,
  });
};
