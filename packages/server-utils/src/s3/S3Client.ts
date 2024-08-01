/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Upload } from '@aws-sdk/lib-storage';
import { GetObjectCommandInput, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getS3UploadFilePath, getS3ImageFilePath, S3_BUCKET_NAME } from './constants';
import { getUniqueFileName } from './getUniqueFileName';
import { S3 } from './S3';

type Base64 = string | null | ArrayBuffer;

const createEncodedFile = (fileObject: File): Promise<Base64> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(fileObject);
  });
};

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

  private async uploadPublicImage(fileName: string, buffer: Buffer, contentType: string) {
    return this.upload(fileName, {
      Body: buffer,
      ACL: 'public-read',
      ContentType: contentType,
      ContentEncoding: 'base64',
    });
  }

  private async uploadPrivateFile(
    fileName: string,
    readable: Buffer | string,
    contentType: string | undefined,
  ) {
    return this.upload(fileName, {
      Body: readable,
      ACL: 'bucket-owner-full-control',
      ContentType: contentType,
      ContentEncoding: 'base64',
    });
  }

  private convertEncodedFileToBuffer(encodedFile: string) {
    // remove the base64 prefix from the image. This handles svg and other image types
    const encodedFileString = encodedFile.replace(new RegExp('(data:)(.*)(;base64,)'), '');

    return Buffer.from(encodedFileString, 'base64');
  }

  private getContentTypeFromBase64(encodedFile: string) {
    const fileType = encodedFile.substring('data:'.length, encodedFile.indexOf(';base64'));
    return fileType;
  }

  public async uploadFile(fileName: string, readable: Buffer | string) {
    const s3UploadFolder = getS3UploadFilePath();
    const s3FilePath = `${s3UploadFolder}${fileName}`;

    const alreadyExists = await this.checkIfFileExists(s3FilePath);

    // If the file already exists, throw an error
    if (alreadyExists) {
      throw new Error(`File ${s3FilePath} already exists on S3, overwrite is not allowed`);
    }

    // If the file is a url string, ignore it
    if (typeof readable === 'string' && readable.includes(s3UploadFolder)) {
      return;
    }

    let buffer = readable;
    let contentType = undefined; // in cases where the file is directly loaded as a buffer, we don't have a content type and it will work without it

    // If the file is a base64 string, convert it to a buffer and get the file type. If we don't do this, the file will be uploaded as a binary file and just the text value will be saved and won't be able to be opened
    if (typeof readable === 'string') {
      buffer = this.convertEncodedFileToBuffer(readable);
      contentType = this.getContentTypeFromBase64(readable);
    }

    return this.uploadPrivateFile(s3FilePath, buffer, contentType);
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

    // convert the base64 encoded image to a buffer
    const buffer = this.convertEncodedFileToBuffer(base64EncodedImage);

    const contentType = this.getContentTypeFromBase64(base64EncodedImage);

    // use the file type from the image if it's available, otherwise default to png
    const fileType = contentType.split('/')[1] || 'png';

    // If is not an image file type, e.g. a pdf, throw an error
    if (!imageTypes.includes(fileType)) throw new Error(`File type ${fileType} is not supported`);

    // remove the +xml from the file type if it's an svg+xml so we can use it as the file extension
    const fileExtension = fileType.replace('+xml', '');

    const filePath = getS3ImageFilePath();

    // If a fileId is provided, use it as the file name, otherwise generate a unique file name
    const fileName = fileId
      ? `${filePath}${fileId}.${fileExtension}`
      : `${filePath}${getUniqueFileName()}.${fileExtension}`;

    // In some cases we want to allow overwriting of existing files
    if (!allowOverwrite) {
      if (await this.checkIfFileExists(fileName))
        throw new Error(`File ${fileName} already exists on S3, overwrite is not allowed`);
    }

    return this.uploadPublicImage(fileName, buffer, contentType);
  }

  public async downloadFile(fileName: string) {
    const s3FilePath = `${getS3UploadFilePath()}${fileName}`;
    return this.download(s3FilePath);
  }
}
