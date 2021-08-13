/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import nodemailer from 'nodemailer';
import { getIsProductionEnvironment } from '../devops';

export const sendEmail = async (to, subject, text, attachments) => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SITE_EMAIL_ADDRESS } = process.env;

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
    text: `${text}

Cheers,
The Tupaia Team`,
  });
};
