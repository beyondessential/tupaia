import winston from 'winston';
import { S3Client } from '@tupaia/server-utils';

// Upload a surveyImage to s3
export const addSurveyImage = async (id: string, data: string) => {
  try {
    const s3Client = new S3Client();
    await s3Client.uploadImage(data, id);
  } catch (error: any) {
    winston.error(error.message);
  }
};
