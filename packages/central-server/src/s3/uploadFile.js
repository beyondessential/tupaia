/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import path from 'path';
import { getUploadFilePath } from './constants';
import { S3Client } from './S3Client';
import { getUniqueFileName } from './getUniqueFileName';

export const uploadFile = async filePath => {
  const fileName = path.basename(filePath);
  const s3FilePath = `${getUploadFilePath()}${getUniqueFileName(fileName)}`;

  const s3Client = new S3Client();
  const alreadyExists = await s3Client.checkIfFileExists(s3FilePath);
  if (alreadyExists) {
    throw new Error(`File ${s3FilePath} already exists on S3, overwrite is not allowed`);
  }

  const fileStream = fs.createReadStream(filePath);
  return s3Client.uploadPrivateFile(s3FilePath, fileStream);
};
