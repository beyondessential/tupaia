/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import path from 'path';

export const createDownloadLink = filePath => {
  const fileName = path.basename(filePath);
  return `${process.env.ADMIN_PANEL_SERVER_URL}/v1/export/download/${encodeURIComponent(fileName)}`;
};
