/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import path from 'path';
import fs from 'fs';

enum EmailExportFileModes {
  ATTACHMENT = 'attachment',
  DOWNLOAD_LINK = 'downloadLink',
}

const createDownloadLink = (filePath: string) => {
  const fileName = path.basename(filePath);
  return `${process.env.ADMIN_PANEL_SERVER_URL}/v1/export/download/${encodeURIComponent(fileName)}`;
};

const generateAttachments = async (filePath: string) => {
  const fileName = path.basename(filePath);
  const buffer = await fs.readFileSync(filePath);
  return [{ filename: fileName, content: buffer }];
};

type ResponseBody = {
  error?: string;
  filePath?: string;
};

type ReqBody = {
  emailExportFileMode?: EmailExportFileModes;
};

export const constructExportEmail = async (responseBody: ResponseBody, reqBody: ReqBody) => {
  const { emailExportFileMode = EmailExportFileModes.ATTACHMENT } = reqBody;
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

  if (emailExportFileMode === EmailExportFileModes.ATTACHMENT) {
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
