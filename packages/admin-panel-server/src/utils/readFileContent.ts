/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import fs from 'node:fs';

import { readJsonFile } from '@tupaia/utils';

export const readFileContent = (file: Express.Multer.File) => {
  const { path } = file;
  const fileContents = readJsonFile(path);
  fs.unlinkSync(path);
  return fileContents;
};
