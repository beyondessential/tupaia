/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import AWS from 'aws-sdk';
import { BUCKET_NAME } from './constants';

export class S3Client {
  constructor() {
    this.s3 = new AWS.S3();
  }

  async checkIfFileExists(fileName) {
    return new Promise(resolve => {
      this.s3
        .headObject({
          Bucket: BUCKET_NAME,
          Key: fileName,
        })
        .on('success', () => {
          resolve(true);
        })
        .on('error', () => {
          resolve(false);
        })
        .send();
    });
  }

  async uploadFile(fileName, buffer) {
    return new Promise((resolve, reject) => {
      this.s3.upload(
        {
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ACL: 'public-read',
          ContentType: 'image/png',
          ContentEncoding: 'base64',
        },
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data.Location);
          }
        },
      );
    });
  }
}
