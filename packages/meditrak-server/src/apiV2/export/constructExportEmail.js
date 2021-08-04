/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { uploadFile } from '../../s3';

const constructMessage = async responseBody => {
  const { error, filePath } = responseBody;

  if (error) {
    return `Unfortunately, your export failed.

${error}`;
  }

  if (!filePath) {
    throw new Error('No filePath in export response body');
  }

  const downloadLink = await uploadFile(filePath);

  return `Please click this one-time link to download your requested export: ${downloadLink}

Note that after clicking it once, you won't be able to download the file again.`;
};

export const constructExportEmail = async responseBody => ({
  subject: 'Your export from Tupaia',
  message: await constructMessage(responseBody),
});
