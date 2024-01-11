/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import path from 'path';
import fs from 'fs';
import { createDownloadLink } from './download';

const EMAIL_EXPORT_FILE_MODES = {
  ATTACHMENT: 'attachment',
  DOWNLOAD_LINK: 'downloadLink',
};

const generateAttachments = async filePath => {
  const fileName = path.basename(filePath);
  const buffer = await fs.readFileSync(filePath);
  return [{ filename: fileName, content: buffer }];
};

export const constructExportEmail = async (responseBody, req) => {
  const { emailExportFileMode = EMAIL_EXPORT_FILE_MODES.DOWNLOAD_LINK } = req.query;
  const { error, filePath } = responseBody;
  const subject = 'Your export from Tupaia';
  if (error) {
    return {
      subject,
      message: `Unfortunately, your export failed.
${error}`,
    };
  }

  if (!filePath) {
    throw new Error('No filePath in export response body');
  }

  if (emailExportFileMode === EMAIL_EXPORT_FILE_MODES.ATTACHMENT) {
    return {
      subject,
      message: 'Please find your requested export attached to this email.',
      attachments: await generateAttachments(filePath),
    };
  }

  const downloadLink = createDownloadLink(filePath);
  return {
    subject,
    message: `Please click this one-time link to download your requested export: ${downloadLink}
Note that you need to be logged in to the admin panel for it to work, and after clicking it once, you won't be able to download the file again.`,
  };
};
