import { getIsProductionEnvironment } from '@tupaia/utils';

export const S3_BUCKET_NAME = 'tupaia';
export const S3_BUCKET_PATH = `https://${S3_BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/`;
export const getS3ImageFilePath = () =>
  getIsProductionEnvironment() ? 'uploads/images/' : 'dev_uploads/images/';
export const getS3UploadFilePath = () =>
  getIsProductionEnvironment() ? 'uploads/files/' : 'dev_uploads/files/';

/**
 * URL of an image `S3Client.uploadImage` converted to WebP and stored under `fileId`. Survey photos
 * uploaded ahead of their answers, by MediTrak and DataTrak, live here.
 */
export const getS3ImageUrl = (fileId: string) =>
  `${S3_BUCKET_PATH}${getS3ImageFilePath()}${fileId}.webp`;
