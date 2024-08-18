/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import path from 'path';
import { requireEnv } from '@tupaia/utils';

const createDownloadLink = (filePath: string, url: string) => {
  const fileName = path.basename(filePath);
  return `${url}/export/download/${encodeURIComponent(fileName)}`;
};

type ResponseBody = {
  error?: string;
  filePath?: string;
};

type Req = {
  query: {
    platform?: 'tupaia' | 'adminPanel' | 'datatrak';
  };
};

export const constructExportEmail = async (responseBody: ResponseBody, req: Req) => {
  const { error, filePath } = responseBody;
  const { platform } = req.query;
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

  const platformKey = platform || 'adminPanel';

  const PLATFORM_SETTINGS = {
    tupaia: {
      url: requireEnv('TUPAIA_WEB_SERVER_API_URL'),
      friendlyName: 'Tupaia',
    },
    adminPanel: {
      url: requireEnv('ADMIN_PANEL_SERVER_API_URL'),
      friendlyName: 'the Admin Panel',
    },
    datatrak: {
      url: requireEnv('DATATRAK_WEB_SERVER_API_URL'),
      friendlyName: 'DataTrak',
    },
  };

  if (!PLATFORM_SETTINGS[platformKey]) {
    throw new Error(`No API config found for platform: ${platformKey}`);
  }

  const { friendlyName, url } = PLATFORM_SETTINGS[platformKey];

  const downloadLink = createDownloadLink(filePath, url);
  return {
    subject,
    message: `Please click this one-time link to download your requested export: ${downloadLink}
  Note that you need to be logged in to ${friendlyName} for it to work, and after clicking it once, you won't be able to download the file again.`,
  };
};
