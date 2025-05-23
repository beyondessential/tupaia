import { getIsProductionEnvironment } from '@tupaia/utils';

export const S3_BUCKET_NAME = 'tupaia';
export const S3_BUCKET_PATH = `https://s3-ap-southeast-2.amazonaws.com/${S3_BUCKET_NAME}/`;
export const getS3ImageFilePath = () =>
  getIsProductionEnvironment() ? 'uploads/images/' : 'dev_uploads/images/';
export const getS3UploadFilePath = () =>
  getIsProductionEnvironment() ? 'uploads/files/' : 'dev_uploads/files/';
