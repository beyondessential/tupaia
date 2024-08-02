/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { getEnvVarOrDefault, getIsProductionEnvironment, requireEnv } from '@tupaia/utils';
import Mail from 'nodemailer/lib/mailer';
import handlebars from 'handlebars';

const TEXT_SIGN_OFF = 'Cheers,\n\nThe Tupaia Team';
const HTML_SIGN_OFF = '<p>Cheers,<br><br>The Tupaia Team</p>';

type MailOptions = {
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Mail.Attachment[];
  signOff?: string;
};

type TemplateContext = {
  text?: string;
  signOff?: string;
};

const compileHtml = (context: TemplateContext) => {
  const templatePath = path.resolve(__dirname, './templates/template.handlebars');
  const template = fs.readFileSync(templatePath);
  const compiledTemplate = handlebars.compile(template.toString());
  return compiledTemplate(context);
};

export const sendEmail = async (to: string | string[], mailOptions: MailOptions = {}) => {
  const {
    subject,
    text,
    html,
    attachments,
    signOff = html ? HTML_SIGN_OFF : TEXT_SIGN_OFF,
  } = mailOptions;
  const SMTP_HOST = getEnvVarOrDefault('SMTP_HOST', undefined);
  const SMTP_USER = getEnvVarOrDefault('SMTP_USER', undefined);
  const SMTP_PASSWORD = getEnvVarOrDefault('SMTP_PASSWORD', undefined);
  const SITE_EMAIL_ADDRESS = getEnvVarOrDefault('SITE_EMAIL_ADDRESS', undefined);

  if (text && html) {
    throw new Error('Only text or HTML can be sent in an email, not both');
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
  const fullHtml = compileHtml({ text, signOff });
  // html ? `${html}<br>${signOff}` : undefined;

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
