/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { fromEnv } from '@aws-sdk/credential-providers';
import { S3 } from '@aws-sdk/client-s3';
import winston from 'winston';
import { S3Client } from '@tupaia/utils';

// Upload a surveyImage to s3
export const addSurveyImage = async (models, { id, data }) => {
  try {
    const s3Client = new S3Client(new S3({ credentials: fromEnv() }));
    await s3Client.uploadImage(data, id);
  } catch (error) {
    winston.error(error.message);
  }
};
