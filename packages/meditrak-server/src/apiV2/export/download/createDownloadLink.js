/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const createDownloadLink = fileName => {
  return `http://localhost:8070/v1/export/download/${fileName}`;
};
