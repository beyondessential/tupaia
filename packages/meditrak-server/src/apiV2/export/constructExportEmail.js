/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const constructMessage = responseBody => {
  const { error } = responseBody;

  if (error) {
    return `Unfortunately, your export failed.

${error}`;
  }

  return 'Please find your requested export attached.';
};

const constructAttachments = async responseBody => {
  const { filePath } = responseBody;
  if (!filePath) {
    throw new Error('No export file provided to email responder');
  }
  return [{ path: filePath }];
};

export const constructExportEmail = async responseBody => ({
  subject: 'Your export from Tupaia',
  message: constructMessage(responseBody),
  attachments: await constructAttachments(responseBody),
});
