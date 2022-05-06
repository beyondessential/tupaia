/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { createDownloadLink } from './download';

const constructMessage = responseBody => {
  const { error, filePath } = responseBody;

  if (error) {
    return `Unfortunately, your export failed.

${error}`;
  }

  if (!filePath) {
    throw new Error('No filePath in export response body');
  }

  const downloadLink = createDownloadLink(filePath);

  return `Please click this one-time link to download your requested export: ${downloadLink}

Note that you need to be logged in to the admin panel for it to work, and after clicking it once, you won't be able to download the file again.`;
};

export const constructExportEmail = responseBody => ({
  subject: 'Your export from Tupaia',
  message: constructMessage(responseBody),
});
