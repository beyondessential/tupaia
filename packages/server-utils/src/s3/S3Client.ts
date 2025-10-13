import { GetObjectCommandInput, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import sharp from 'sharp';

import { ConflictError, UnprocessableContentError, UnsupportedMediaTypeError } from '@tupaia/utils';
import { getS3ImageFilePath, getS3UploadFilePath, S3_BUCKET_NAME } from './constants';
import { getUniqueFileName } from './getUniqueFileName';
import { S3 } from './S3';

const MAX_IMAGE_SIZE = 3_000;

/** Formats officially supported by Sharp */
const supportedImageTypes = {
  'image/avif': { extension: 'avif', humanReadableName: 'AVIF', shouldConvert: true },
  'image/gif': { extension: 'gif', humanReadableName: 'GIF', shouldConvert: true },
  'image/jpeg': { extension: 'jpg', humanReadableName: 'JPEG', shouldConvert: true },
  'image/png': { extension: 'png', humanReadableName: 'PNG', shouldConvert: true },
  'image/svg+xml': { extension: 'svg', humanReadableName: 'SVG', shouldConvert: false },
  'image/tiff': { extension: 'tiff', humanReadableName: 'TIFF', shouldConvert: true },
  'image/webp': { extension: 'webp', humanReadableName: 'WebP', shouldConvert: true },
} as const;

type NonconvertedImageType = {
  [K in keyof typeof supportedImageTypes]: (typeof supportedImageTypes)[K]['shouldConvert'] extends false
    ? K
    : never;
}[keyof typeof supportedImageTypes];

function isBase64DataUri(val: string): val is `data:${string};base64,${string}` {
  return val.startsWith('data:') && val.includes(';base64,');
}

function isImageMediaTypeString(val: string): val is `image/${string}` {
  // Check length because 'image/' alone is invalid
  return val.length > 'image/'.length && val.startsWith('image/');
}

function isSupportedImageMediaTypeString(val: string): val is keyof typeof supportedImageTypes {
  return supportedImageTypes.hasOwnProperty(val);
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
    const encodedFileString = encodedFile.replace(new RegExp('(data:)(.*)(;base64,)'), '');

    return Buffer.from(encodedFileString, 'base64');
  }

  private getContentTypeFromBase64(base64String: string) {
    if (!isBase64DataUri(base64String)) {
      throw new UnprocessableContentError(
        `Invalid Base64 data URI. Expected ‘data:content/type;base64,...’ but got: ‘${base64String.substring(0, 40)}...’`,
      );
    }

    return base64String.substring('data:'.length, base64String.indexOf(';base64,', 'data:'.length));
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
    let contentType = undefined; // in cases where the file is directly loaded as a buffer, we don't have a content type and it will work without it
    let contentEncoding = undefined;

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
    let buffer: Buffer = this.convertEncodedFileToBuffer(base64EncodedImage);
    const sourceContentType = this.getContentTypeFromBase64(base64EncodedImage);

    if (!isImageMediaTypeString(sourceContentType)) {
      // Redundant because of `isSupportedImageMediaTypeString`, but clearer error message
      throw new UnsupportedMediaTypeError(`Expected image file but got ${sourceContentType}`);
    }

    if (!isSupportedImageMediaTypeString(sourceContentType)) {
      const humanReadableList = Object.values(supportedImageTypes)
        .map(type => type.humanReadableName)
        .join(', ');
      throw new UnsupportedMediaTypeError(
        `${sourceContentType} images aren’t supported. Please provide one of: ${humanReadableList}`,
      );
    }

    const destinationContentType = supportedImageTypes[sourceContentType].shouldConvert
      ? 'image/webp'
      : (sourceContentType as NonconvertedImageType);

    if (supportedImageTypes[sourceContentType].shouldConvert) {
      buffer = await sharp(buffer)
        .autoOrient()
        .keepIccProfile()
        .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 90 })
        .toBuffer();
    }

    const dirname = getS3ImageFilePath();
    const { extension } = supportedImageTypes[destinationContentType];
    // If a fileId is provided, use it as the file name, otherwise generate a unique file name
    const basename = `${fileId || getUniqueFileName()}.${extension}`;
    const filePath = `${dirname}${basename}`;

    // In some cases we want to allow overwriting of existing files
    if (!allowOverwrite && (await this.checkIfFileExists(filePath))) {
      throw new ConflictError(`File ${filePath} already exists on S3, overwrite is not allowed`);
    }

    return this.uploadPublicImage(filePath, buffer, destinationContentType);
  }

  public async downloadFile(fileName: string) {
    const s3FilePath = `${getS3UploadFilePath()}${fileName}`;
    return this.download(s3FilePath);
  }
}
