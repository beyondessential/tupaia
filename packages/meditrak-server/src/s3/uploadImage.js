/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { getS3Client } from './index';
import { BUCKET_NAME, getImageFilePath } from './constants';

export const uploadImage = (base64EncodedImage, fileId) => {
  const buffer = Buffer.from(base64EncodedImage, 'base64');
  const filePath = getImageFilePath();
  const fileName = fileId
    ? `${filePath}${fileId}.png`
    : `${filePath}${getCurrentTime()}_${getRandomInteger()}.png`;
  return new Promise((resolve, reject) => {
    const s3Client = getS3Client();
    s3Client.upload(
      {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
        ContentType: 'image/png',
        ContentEncoding: 'base64',
      },
      (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.Location);
        }
      },
    );
  });
};

const getRandomInteger = () => Math.floor(Math.random() * 1000000 + 1);
const getCurrentTime = () => new Date().getTime();
