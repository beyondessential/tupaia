/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { fromUrl as parseS3Url } from 's3urls';
import { getS3Client } from './index';

/**
 * Delete an image (or any object really) from Amazon S3 based on the URL
 */
export const deleteImage = imageUrl => {
  const { Bucket: bucket, Key: key } = parseS3Url(imageUrl);
  const s3Client = getS3Client();
  s3Client.deleteObject({
    Bucket: bucket,
    Key: key,
  });
};
