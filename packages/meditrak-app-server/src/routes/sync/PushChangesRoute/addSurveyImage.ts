/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import AWS from 'aws-sdk';
import winston from 'winston';
import { S3Client } from '@tupaia/utils';

// Upload a surveyImage to s3
export const addSurveyImage = async (id: string, data: string) => {
  try {
    const s3Client = new S3Client(new AWS.S3());
    await s3Client.uploadImage(data, id);
  } catch (error: any) {
    winston.error(error.message);
  }
};
