import winston from 'winston';
import { S3Client } from '@tupaia/server-utils';

// Upload a surveyImage to s3
export const addSurveyImage = async (models, { id, data }) => {
  try {
    const s3Client = new S3Client();
    await s3Client.uploadImage(data, id);
  } catch (error) {
    winston.error(error.message);
  }
};
