import { S3Client, S3 } from '@tupaia/server-utils';
import { getStandardisedImageName } from '../../utilities';

/**
 *
 * @param {string} encodedImage
 * @param {string} uniqueId
 * @param {string} imageSuffix
 * @param {boolean} useTimestamp (if true, the image will be uploaded with a timestamp appended to the end of the filename)
 * @param {string} existingImagePath (if there is an existing image for the same field, this should be passed in so that it can be deleted before uploading the new image)
 * @returns {string} The URL of the uploaded image
 */
export const uploadImage = async (
  encodedImage,
  uniqueId,
  imageSuffix,
  useTimestamp = false,
  existingImagePath,
) => {
  // If the image is undefined then we are removing the value from the field (but not deleting the image), so return an empty string
  if (encodedImage === undefined) return '';
  // If the image is not a base64 encoded image, then it is an external URL (which we need to accept for backwards compatibility with the older way of uploading things like project images).
  // If the image is null or an empty string, we are not editing it, so return as usual.
  if (encodedImage === null || !encodedImage.includes('data:image')) return encodedImage;
  const s3Client = new S3Client(new S3());

  // If there is an existing image, remove it before uploading the new one so that we don't end up with extra images for the same field
  if (existingImagePath) await s3Client.deleteFile(existingImagePath);

  // Upload the new image with a standardised name
  const uploadedImageURL = await s3Client.uploadImage(
    encodedImage,
    getStandardisedImageName(uniqueId, imageSuffix, useTimestamp),
    true,
  );
  return uploadedImageURL;
};
