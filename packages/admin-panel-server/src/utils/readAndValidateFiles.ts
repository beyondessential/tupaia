/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';

import { readJsonFile, yup } from '@tupaia/utils';

export const readAndValidateFiles = <T extends yup.AnySchema>(
  files: Record<string, Express.Multer.File[]> | Express.Multer.File[],
  validator: T,
) => {
  const fileArray = Array.isArray(files) ? files : Object.values(files).flat();
  return Object.fromEntries(
    fileArray.map(file => {
      const { path, originalname } = file;
      try {
        const fileContents = readJsonFile(path);
        fs.unlinkSync(path);
        return [originalname, validator.validateSync(fileContents)];
      } catch (error: any) {
        throw new Error(`Error in ${originalname}: ${error.message}`);
      }
    }),
  );
};
