/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import path from 'path';

export const createDownloadLink = filePath => {
  const fileName = path.basename(filePath);
  return `http://localhost:8070/v1/export/download/${fileName}`;
};
