/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';

import { readJsonFile } from '@tupaia/utils';

export const readFileContent = (file: Express.Multer.File) => {
  const { path } = file;
  const fileContents = readJsonFile(path);
  fs.unlinkSync(path);
  return fileContents;
};
