/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Upload } from '@aws-sdk/lib-storage';
import { GetObjectCommandInput, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getS3UploadFilePath, getS3ImageFilePath, S3_BUCKET_NAME } from './constants';
import { getUniqueFileName } from './getUniqueFileName';
import { S3 } from './S3';

export class S3Client {
  private readonly s3: S3;

  public constructor(s3Instance: S3) {
    this.s3 = s3Instance;
  }

  private async checkIfFileExists(fileName: string) {
    return this.s3
      .headObject({
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
      })
      .then(() => true)
      .catch(() => false);
  }

  private async upload(fileName: string, config?: Partial<PutObjectCommandInput>) {
    const uploader = new Upload({
      client: this.s3,
      params: {
        ...config,
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
      },
    });

    const result = await uploader.done();

    if ('Location' in result) {
      return result.Location;
    }

    throw new Error(`S3 upload failed`);
  }

  private async download(filePath: string, config?: Partial<GetObjectCommandInput>) {
    const response = await this.s3.getObject({
      ...config,
      Bucket: S3_BUCKET_NAME,
      Key: filePath,
    });

    return response.Body;
  }

  private async uploadPublicImage(fileName: string, buffer: Buffer, fileType: string) {
    return this.upload(fileName, {
      Body: buffer,
      ACL: 'public-read',
      ContentType: `image/${fileType}`,
      ContentEncoding: 'base64',
    });
  }

  private async uploadPrivateFile(fileName: string, readable: Buffer | string) {
    return this.upload(fileName, {
      Body: readable,
      ACL: 'bucket-owner-full-control',
    });
  }

  public async uploadFile(fileName: string, readable: Buffer | string) {
    const s3FilePath = `${getS3UploadFilePath()}${fileName}`;

    const alreadyExists = await this.checkIfFileExists(s3FilePath);
    if (alreadyExists) {
      throw new Error(`File ${s3FilePath} already exists on S3, overwrite is not allowed`);
    }

    return this.uploadPrivateFile(s3FilePath, readable);
  }

  public async deleteFile(filePath: string) {
    const fileName = filePath.split(getS3ImageFilePath())[1];
    if (!(await this.checkIfFileExists(fileName))) return null;
    return this.s3.deleteObject({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });
  }

  public async uploadImage(base64EncodedImage = '', fileId: string, allowOverwrite = false) {
    const imageTypes = ['png', 'jpeg', 'jpg', 'gif', 'svg+xml'];
    const encodedImageString = base64EncodedImage.replace(
      new RegExp('(data:image)(.*)(;base64,)'),
      '',
    );
    // remove the base64 prefix from the image. This handles svg and other image types
    const buffer = Buffer.from(encodedImageString, 'base64');

    // use the file type from the image if it's available, otherwise default to png
    const fileType =
      base64EncodedImage.includes('data:image') && base64EncodedImage.includes(';base64')
        ? base64EncodedImage.substring('data:image/'.length, base64EncodedImage.indexOf(';base64'))
        : 'png';

    // If is not an image file type, e.g. a pdf, throw an error
    if (!imageTypes.includes(fileType)) throw new Error(`File type ${fileType} is not supported`);

    const fileExtension = fileType.replace('+xml', '');

    const filePath = getS3ImageFilePath();
    const fileName = fileId
      ? `${filePath}${fileId}.${fileExtension}`
      : `${filePath}${getUniqueFileName()}.${fileExtension}`;
    // In some cases we want to allow overwriting of existing files
    if (!allowOverwrite) {
      if (await this.checkIfFileExists(fileName))
        throw new Error(`File ${fileName} already exists on S3, overwrite is not allowed`);
    }
    return this.uploadPublicImage(fileName, buffer, fileType);
  }

  public async downloadFile(fileName: string) {
    const s3FilePath = `${getS3UploadFilePath()}${fileName}`;
    return this.download(s3FilePath);
  }
}
