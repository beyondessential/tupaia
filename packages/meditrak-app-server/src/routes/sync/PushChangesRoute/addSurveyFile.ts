/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { S3Client, S3 } from '@tupaia/utils';

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

export const addSurveyFile = async (filename: string, data: string) => {
  try {
    const s3Client = new S3Client(new S3());
    await s3Client.uploadFile(filename, data);
  } catch (error: any) {
    winston.error(error.message);
  }
};
