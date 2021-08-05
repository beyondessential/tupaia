/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import fs from 'fs';

const EXPORT_BASE_PATH = 'exports';
export const getExportPathForUser = userId => {
  const exportPath = `${EXPORT_BASE_PATH}/${userId}`;

  // Make the export directory if it doesn't already exist
  try {
    fs.statSync(exportPath);
  } catch (e) {
    fs.mkdirSync(exportPath);
  }
  return exportPath;
};
