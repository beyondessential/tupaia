/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { getImageFilePath } from './constants';
import { S3Client } from './S3Client';

export const uploadImage = async (base64EncodedImage, fileId) => {
  const buffer = Buffer.from(base64EncodedImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const filePath = getImageFilePath();
  const fileName = fileId
    ? `${filePath}${fileId}.png`
    : `${filePath}${getCurrentTime()}_${getRandomInteger()}.png`;

  const s3Client = new S3Client();
  const alreadyExists = await s3Client.checkIfFileExists(fileName);
  if (alreadyExists) {
    throw new Error(`File ${fileName} already exists on S3, overwrite is not allowed`);
  }
  return s3Client.uploadFile(fileName, buffer);
};

const getRandomInteger = () => Math.floor(Math.random() * 1000000 + 1);
const getCurrentTime = () => new Date().getTime();
