import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { getEnvVarOrDefault, getIsProductionEnvironment, requireEnv } from '@tupaia/utils';
import Mail from 'nodemailer/lib/mailer';
import handlebars from 'handlebars';

type CTA = {
  text: string;
  url: string;
};
type TemplateContext = {
  signOff?: string;
  templateName: string;
  templateContext: Record<string, any> & {
    cta?: CTA;
    title: string;
  };
};

type MailOptions = TemplateContext & {
  subject?: string;
  attachments?: Mail.Attachment[];
  signOff?: string;
};

const compileHtml = (context: TemplateContext) => {
  const { templateName, templateContext } = context;
  const templatePath = path.resolve(__dirname, './templates/wrapper.html');
  const mainTemplate = fs.readFileSync(templatePath);
  const compiledTemplate = handlebars.compile(mainTemplate.toString());
  let content = '';
  if (templateName) {
    const innerContentTemplate = fs.readFileSync(
      path.resolve(__dirname, `./templates/content/${templateName}.html`),
    );
    content = handlebars.compile(innerContentTemplate.toString())(templateContext);
  }
  return compiledTemplate({
    ...templateContext,
    content,
  }).toString();
};

export const sendEmail = async (to: string | string[], mailOptions: MailOptions) => {
  const { subject, templateName, templateContext, attachments, signOff } = mailOptions || {};
  const SMTP_HOST = getEnvVarOrDefault('SMTP_HOST', undefined);
  const SMTP_USER = getEnvVarOrDefault('SMTP_USER', undefined);
  const SMTP_PASSWORD = getEnvVarOrDefault('SMTP_PASSWORD', undefined);
  const SITE_EMAIL_ADDRESS = getEnvVarOrDefault('SITE_EMAIL_ADDRESS', undefined);

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

  const fullHtml = compileHtml({ templateName, templateContext, signOff });

  return transporter.sendMail({
    from: `Tupaia <${SITE_EMAIL_ADDRESS}>`,
    sender: SITE_EMAIL_ADDRESS,
    to: sendTo,
    subject,
    attachments,
    html: fullHtml,
  });
};
