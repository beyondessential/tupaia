import { GetObjectCommandInput, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { ConflictError, UnsupportedMediaTypeError } from '@tupaia/utils';
import { getS3ImageFilePath, getS3UploadFilePath, S3_BUCKET_NAME } from './constants';
import { getUniqueFileName } from './getUniqueFileName';
import { S3 } from './S3';

/** Non-animated image types that are generally web-safe. */
const supportedImageTypes = {
  'image/avif': { extension: 'avif', humanReadableName: 'AVIF' },
  'image/gif': { extension: 'gif', humanReadableName: 'GIF' },
  'image/jpeg': { extension: 'jpg', humanReadableName: 'JPEG' },
  'image/png': { extension: 'png', humanReadableName: 'PNG' },
  'image/svg+xml': { extension: 'svg', humanReadableName: 'SVG' },
  'image/webp': { extension: 'webp', humanReadableName: 'WebP' },
} as const;

function isBase64DataUri(val: string): val is `data:${string};base64,${string}` {
  return val.startsWith('data:') && val.includes(';base64,');
}

function isImageMediaTypeString(val: string): val is `image/${string}` {
  // Check length because 'image/' alone is invalid
  return val.length > 'image/'.length && val.startsWith('image/');
}

function isSupportedImageMediaTypeString(val: string): val is keyof typeof supportedImageTypes {
  return Object.hasOwn(supportedImageTypes, val);
}

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

  /** Returns URL of the uploaded file (i.e. the S3 object URL). */
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
    return await this.upload(fileName, {
      Body: buffer,
      ACL: 'public-read',
      ContentType: contentType,
      ContentEncoding: 'base64',
    });
  }

  private async uploadPrivateFile(
    fileName: string,
    readable: Buffer | string,
    contentType?: string,
    contentEncoding?: string,
  ) {
    return this.upload(fileName, {
      Body: readable,
      ACL: 'bucket-owner-full-control',
      ContentType: contentType,
      ContentEncoding: contentEncoding,
    });
  }

  private convertEncodedFileToBuffer(encodedFile: string) {
    // remove the base64 prefix from the image. This handles svg and other image types
    const encodedFileString = encodedFile.replace(/^data:.+;base64,/, '');
    return Buffer.from(encodedFileString, 'base64');
  }

  private getContentTypeFromBase64(base64String: string) {
    try {
      if (!isBase64DataUri(base64String)) {
        throw new Error(
          `Invalid Base64 data URI. Expected ‘data:content/type;base64,...’ but got: ‘${base64String.substring(0, 40)}...’`,
        );
      }

      return base64String.substring(
        'data:'.length,
        base64String.indexOf(';base64,', 'data:'.length),
      ) as `${string}/${string}`;
    } catch {
      // MediTrak just sends Base64-encoded JPEG data, not as a data URI, so we (dangerously) assume
      // this is what we’re dealing with
      return 'image/jpeg';
    }
  }

  public async uploadFile(fileName: string, readable: Buffer | string) {
    const s3UploadFolder = getS3UploadFilePath();
    const s3FilePath = `${s3UploadFolder}${fileName}`;

    const alreadyExists = await this.checkIfFileExists(s3FilePath);

    // If the file already exists, throw an error
    if (alreadyExists) {
      throw new ConflictError(`File ${s3FilePath} already exists on S3, overwrite is not allowed`);
    }

    // If the file is a url string, ignore it because it's not a file. This shouldn't happen but it's a safety check
    if (typeof readable === 'string' && readable.includes(s3UploadFolder)) {
      return;
    }

    let buffer = readable;
    /**
     * In cases where the file is directly loaded as a buffer, we don’t have a content type and it
     * will work without it
     */
    let contentType: `${string}/${string}` | undefined;
    let contentEncoding: 'base64' | undefined;

    // If the file is a base64 string, convert it to a buffer and get the file type. If we don't do this, the file will be uploaded as a binary file and just the text value will be saved and won't be able to be opened
    if (typeof readable === 'string') {
      buffer = this.convertEncodedFileToBuffer(readable);
      contentType = this.getContentTypeFromBase64(readable);
      contentEncoding = 'base64';
    }

    return this.uploadPrivateFile(s3FilePath, buffer, contentType, contentEncoding);
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
    // convert the base64 encoded image to a buffer
    const buffer = this.convertEncodedFileToBuffer(base64EncodedImage);
    const contentType = this.getContentTypeFromBase64(base64EncodedImage);

    if (!isImageMediaTypeString(contentType)) {
      // Redundant because of `isSupportedImageMediaTypeString`, but clearer error message
      throw new UnsupportedMediaTypeError(`Expected image file but got ${contentType}`);
    }

    if (!isSupportedImageMediaTypeString(contentType)) {
      const humanReadableList = Object.values(supportedImageTypes)
        .map(type => type.humanReadableName)
        .join(', ');
      throw new UnsupportedMediaTypeError(
        `${contentType} images aren’t supported. Please provide one of: ${humanReadableList}`,
      );
    }

    const dirname = getS3ImageFilePath();
    const fileExtension = supportedImageTypes[contentType].extension;
    // If a fileId is provided, use it as the file name, otherwise generate a unique file name
    const basename = `${fileId || getUniqueFileName()}.${fileExtension}`;
    const filePath = `${dirname}${basename}`;

    // In some cases we want to allow overwriting of existing files
    if (!allowOverwrite && (await this.checkIfFileExists(filePath))) {
      throw new ConflictError(`File ${filePath} already exists on S3, overwrite is not allowed`);
    }

    return await this.uploadPublicImage(filePath, buffer, contentType);
  }

  public async downloadFile(fileName: string) {
    const s3FilePath = `${getS3UploadFilePath()}${fileName}`;
    return this.download(s3FilePath);
  }
}
