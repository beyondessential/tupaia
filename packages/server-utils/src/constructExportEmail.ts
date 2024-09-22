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

type Req = {
  query: {
    emailExportFileMode?: EmailExportFileModes;
  };
};

export const constructExportEmail = async (responseBody: ResponseBody, req: Req) => {
  const { emailExportFileMode = EmailExportFileModes.DOWNLOAD_LINK } = req.query;
  const { error, filePath } = responseBody;
  const subject = 'Your export from Tupaia';
  if (error) {
    return {
      subject,
      templateContext: {
        title: 'Export failed',
        message: `Unfortunately, your export failed.
        ${error}`,
      },
    };
  }

  if (!filePath) {
    throw new Error('No filePath in export response body');
  }

  if (emailExportFileMode === EmailExportFileModes.ATTACHMENT) {
    return {
      subject,
      attachments: await generateAttachments(filePath),
      templateContext: {
        title: 'Your export is ready',
        message: 'Please find your requested export attached to this email.',
      },
    };
  }

  const downloadLink = createDownloadLink(filePath);
  return {
    subject,
    templateContext: {
      title: 'Your export is ready',
      message:
        "Here is your one time link to access your requested export.\nNote that you need to be logged in to the admin panel for it to work, and after clicking it once, you won't be able to download the file again.",
      cta: {
        url: downloadLink,
        text: 'Download export',
      },
    },
  };
};
