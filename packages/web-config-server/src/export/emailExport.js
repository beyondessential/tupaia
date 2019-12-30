import fs from 'fs';
import nodemailer from 'nodemailer';

export const emailExport = async (emailAddress, exportFilename, filename) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: process.env.SMTP_HOST,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: process.env.SITE_EMAIL_ADDRESS,
    to: emailAddress,
    subject: 'Your requested Tupaia charts',
    html:
      'Your requested Tupaia charts are attached to this email.<br /><br />Regards,<br />Tupaia Team<br />',
    attachments: [
      {
        filename,
        content: fs.createReadStream(exportFilename),
      },
    ],
  });
};
