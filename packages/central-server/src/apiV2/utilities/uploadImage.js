/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import AWS from 'aws-sdk';
import { S3Client } from '@tupaia/utils';
import { getStandardisedImageName } from '../../utilities';

/**
 *
 * @param {string} encodedImage
 * @param {string} uniqueId
 * @param {string} imageSuffix
 * @returns {string} The URL of the uploaded image
 */
export const uploadImage = async (encodedImage, uniqueId, imageSuffix) => {
  // If the image is undefined then we are deleting it, so return an empty string
  if (encodedImage === undefined) return '';
  // If the image is not a base64 encoded image, then it is an external URL (which we need to accept for backwards compatibility with the older way of uploading things like project images).
  // If the image is null or an empty string, we are not editing it, so return as usual.
  if (encodedImage === null || !encodedImage.includes('data:image')) return encodedImage;
  const s3Client = new S3Client(new AWS.S3());
  const uploadedImageURL = await s3Client.uploadImage(
    encodedImage,
    getStandardisedImageName(uniqueId, imageSuffix),
    true,
  );
  return uploadedImageURL;
};
