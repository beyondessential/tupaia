/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import path from 'path';
import { getS3UploadFilePath, getS3ImageFilePath, S3_BUCKET_NAME } from './constants';
import { getUniqueFileName } from './getUniqueFileName';

export class S3Client {
  constructor(s3Instance) {
    this.s3 = s3Instance;
  }

  /**
   * @private
   * @param {string} fileName
   * @returns {Promise<boolean>} whether file exists
   */
  async checkIfFileExists(fileName) {
    return new Promise(resolve => {
      this.s3
        .headObject({
          Bucket: S3_BUCKET_NAME,
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

  /**
   * @private
   */
  async upload(config) {
    return new Promise((resolve, reject) => {
      this.s3.upload(
        {
          Bucket: S3_BUCKET_NAME,
          ...config,
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

  /**
   * @private
   */
  async uploadPublicImage(fileName, buffer) {
    return this.upload({
      Key: fileName,
      Body: buffer,
      ACL: 'public-read',
      ContentType: 'image/png',
      ContentEncoding: 'base64',
    });
  }

  /**
   * @private
   */
  async uploadPrivateFile(fileName, stream) {
    return this.upload({
      Key: fileName,
      Body: stream,
      ACL: 'bucket-owner-full-control',
    });
  }

  /**
   * @public
   * @param {string} filePath
   * @returns
   */
  async uploadFile(filePath) {
    const fileName = path.basename(filePath);
    const s3FilePath = `${getS3UploadFilePath()}${getUniqueFileName(fileName)}`;

    const alreadyExists = await this.checkIfFileExists(s3FilePath);
    if (alreadyExists) {
      throw new Error(`File ${s3FilePath} already exists on S3, overwrite is not allowed`);
    }

    const fileStream = fs.createReadStream(filePath);
    return this.uploadPrivateFile(s3FilePath, fileStream);
  }

  /**
   * @public
   * @param {*} base64EncodedImage
   * @param {*} [fileId]
   */
  async uploadImage(base64EncodedImage, fileId) {
    const buffer = Buffer.from(
      base64EncodedImage.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );

    const filePath = getS3ImageFilePath();
    const fileName = fileId ? `${filePath}${fileId}.png` : `${filePath}${getUniqueFileName()}.png`;

    const alreadyExists = await this.checkIfFileExists(fileName);
    if (alreadyExists) {
      throw new Error(`File ${fileName} already exists on S3, overwrite is not allowed`);
    }
    return this.uploadPublicImage(fileName, buffer);
  }
}
