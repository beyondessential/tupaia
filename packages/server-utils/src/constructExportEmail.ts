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
    platform?: 'tupaia' | 'adminPanel' | 'datatrak' | 'lesmisAdminPanel';
  };
};

export const constructExportEmail = async (responseBody: ResponseBody, req: Req) => {
  const { error, filePath } = responseBody;
  const { platform } = req.query;

  const platformKey = platform || 'adminPanel';

  /**
   * We don't yet have single sign-on across all platforms, so we need to know which platform the user is on so the correct session is used, from where they requested the export. We also can't use central-server api url for this directly because there needs to be an auth header in the request.
   */
  const PLATFORM_SETTINGS = {
    tupaia: {
      url: requireEnv('TUPAIA_WEB_SERVER_API_URL'),
      friendlyName: 'Tupaia',
    },
    adminPanel: {
      url: requireEnv('ADMIN_PANEL_SERVER_API_URL'),
      friendlyName: 'the Tupaia Admin Panel',
    },
    datatrak: {
      url: requireEnv('DATATRAK_WEB_SERVER_API_URL'),
      friendlyName: 'DataTrak',
    },
    lesmisAdminPanel: {
      url: requireEnv('ADMIN_PANEL_SERVER_API_URL'),
      friendlyName: 'the Lesmis Admin Panel',
    },
  };

  if (!PLATFORM_SETTINGS[platformKey]) {
    throw new Error(`No API config found for platform: ${platformKey}`);
  }

  const { friendlyName, url } = PLATFORM_SETTINGS[platformKey];

  const subject = `Your export from ${friendlyName}`;
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

  const downloadLink = createDownloadLink(filePath, url);
  return {
    subject,
    message: `Please click this one-time link to download your requested export: ${downloadLink}
  Note that you need to be logged in to ${friendlyName} for it to work, and after clicking it once, you won't be able to download the file again.`,
  };
};
