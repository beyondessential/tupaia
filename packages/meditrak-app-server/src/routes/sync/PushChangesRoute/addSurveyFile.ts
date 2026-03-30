import winston from 'winston';
import { S3Client, S3 } from '@tupaia/server-utils';
import { MeditrakAppServerModelRegistry } from '../../../types';

/**
 *  action object e.g.
 * {
 *    "action": "AddSurveyFile",
 *    "payload": {
 *         "uniqueFileName": "5da02ed278d10e8695530688_report.pdf",
 *         "data": "data:application/pdf;base64,..." // etc very long base64 data
 *    }
 *  }
 * */

export const addSurveyFile = async (
  _models: MeditrakAppServerModelRegistry,
  uniqueFileName: string,
  data: string,
) => {
  try {
    const decodedFileBuffer = Buffer.from(data, 'base64');

    const s3Client = new S3Client(new S3());
    await s3Client.uploadFile(uniqueFileName, decodedFileBuffer);
  } catch (error) {
    winston.error((error as Error).message);
  }
};
