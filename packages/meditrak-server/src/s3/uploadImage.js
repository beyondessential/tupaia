/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { getImageFilePath } from './constants';
import { S3Client } from './S3Client';
import { getUniqueFileName } from './getUniqueFileName';

export const uploadImage = async (base64EncodedImage, fileId) => {
  const buffer = Buffer.from(base64EncodedImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const filePath = getImageFilePath();
  const fileName = fileId ? `${filePath}${fileId}.png` : `${filePath}${getUniqueFileName()}.png`;

  const s3Client = new S3Client();
  const alreadyExists = await s3Client.checkIfFileExists(fileName);
  if (alreadyExists) {
    throw new Error(`File ${fileName} already exists on S3, overwrite is not allowed`);
  }
  return s3Client.uploadPublicImage(fileName, buffer);
};
