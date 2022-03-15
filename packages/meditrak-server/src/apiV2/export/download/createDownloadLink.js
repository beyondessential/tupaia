/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
import qs from 'qs';

export const createDownloadLink = filePath => {
  const fileName = path.basename(filePath);
  return `${process.env.ADMIN_PANEL_SERVER_URL}/v1/export/download/${qs.stringify(fileName)}`;
};
