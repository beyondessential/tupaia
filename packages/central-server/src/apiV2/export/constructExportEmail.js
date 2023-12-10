/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import path from 'path';
import fs from 'fs';
import { createDownloadLink } from './download';

const constructMessage = (responseBody, emailAsAttachment) => {
  const { error, filePath } = responseBody;

  if (error) {
    return `Unfortunately, your export failed.

${error}`;
  }

  if (emailAsAttachment) {
    return 'Please find your requested export attached to this email.';
  }

  if (!filePath) {
    throw new Error('No filePath in export response body');
  }

  const downloadLink = createDownloadLink(filePath);

  return `Please click this one-time link to download your requested export: ${downloadLink}

Note that you need to be logged in to the admin panel for it to work, and after clicking it once, you won't be able to download the file again.`;
};

const generateAttachments = async (responseBody, emailAsAttachment) => {
  const { filePath } = responseBody;
  if (emailAsAttachment) {
    const fileName = path.basename(filePath);
    const buffer = await fs.readFileSync(filePath);
    return [{ filename: fileName, content: buffer }];
  }
  return [];
};

export const constructExportEmail = async (responseBody, req) => {
  const { emailAsAttachment } = req.query;
  const attachments = await generateAttachments(responseBody, emailAsAttachment);
  const message = constructMessage(responseBody, emailAsAttachment);
  return {
    subject: 'Your export from Tupaia',
    message,
    attachments,
  };
};
