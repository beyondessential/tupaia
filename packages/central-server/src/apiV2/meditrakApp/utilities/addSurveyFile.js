/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import AWS from 'aws-sdk';
import winston from 'winston';
import { S3Client } from '@tupaia/utils';

/**
 *  action object e.g.
 * {
 *    "action": "AddSurveyFile",
 *    "payload": {
 *         "id": "5da02ed278d10e8695530688",
 *         "filename": "report.pdf",
 *         "data": "ASDFJASD..." // etc very long base64 data
 *    }
 *  }
 * */

export const addSurveyFile = async (models, { filename, data }) => {
  try {
    const s3Client = new S3Client(new AWS.S3());
    await s3Client.uploadFileFromBase64(filename, data);
  } catch (error) {
    winston.error(error.message);
  }
};
