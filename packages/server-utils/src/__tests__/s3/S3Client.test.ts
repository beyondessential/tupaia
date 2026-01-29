import type { CompleteMultipartUploadOutput } from '@aws-sdk/client-s3';
import path from 'node:path';

import { ConflictError, UnsupportedMediaTypeError } from '@tupaia/utils';
import { configureDotEnv } from '../../configureDotEnv';
import { S3, S3Client } from '../../s3';
import * as getUniqueFileNameModule from '../../s3/getUniqueFileName';

configureDotEnv([path.resolve(__dirname, '../../../../../env/aws.env')]);

/**
 * `S3Client#upload` creates an `Upload` instance; but this test suite doesn’t
 * actually upload files.
 */
jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({
      Bucket: 'mock-bucket',
      Key: 'uploads/files/test.webp',
      Location: 'https://s3.tupaia.org/uploads/files/test.webp',
    } satisfies CompleteMultipartUploadOutput),
  })),
}));

describe('S3Client', () => {
  let s3Client: S3Client;
  beforeEach(() => {
    jest.clearAllMocks();
    s3Client = new S3Client(new S3());
  });

  describe('uploadImage', () => {
    /** 1×1 transparent GIF */
    const base64Gif =
      'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

    it('should throw if file is not an image', async () => {
      /** ‘Hello World’, encoded */
      const base64TextFile = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
      const fileId = crypto.randomUUID();

      await expect(s3Client.uploadImage(base64TextFile, fileId)).rejects.toThrow(
        new UnsupportedMediaTypeError('Expected image file but got text/plain'),
      );
    });

    it('should throw if image type is not supported', async () => {
      /** 1×1 transparent HEIF */
      const base64Heif =
        'data:image/heic;base64,AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAACWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAAAAAAAAAAAAAAAAAAAAADnBpdG0AAAAAAAEAAAA0aWxvYwAAAABEQAACAAEAAAAAAngAAQAAAAAAAAArAAIAAAAAAqMAAQAAAAAAAAAjAAAAOGlpbmYAAAAAAAIAAAAVaW5mZQIAAAAAAQAAaHZjMQAAAAAVaW5mZQIAAAAAAgAAaHZjMQAAAAGXaXBycAAAAXBpcGNvAAAAdmh2Y0MBA3AAAAAAAAAAAAAe8AD8/fj4AAAPA2AAAQAYQAEMAf//A3AAAAMAkAAAAwAAAwAeugJAYQABACpCAQEDcAAAAwCQAAADAAADAB6gIIEFluqumubgIaDAgAAAAwCAAAADAIRiAAEABkQBwXPBiQAAABRpc3BlAAAAAAAAAEAAAABAAAAAKGNsYXAAAAABAAAAAQAAAAEAAAAB////wQAAAAL////BAAAAAgAAABBwaXhpAAAAAAMICAgAAABxaHZjQwEECAAAAAAAAAAAAB7wAPz8+PgAAA8DYAABABdAAQwB//8ECAAAAwCf+AAAAwAAHroCQGEAAQAmQgEBBAgAAAMAn/gAAAMAAB7AggQWW6q6a5sCAAADAAIAAAMAAhBiAAEABkQBwXPBiQAAAA5waXhpAAAAAAEIAAAAJ2F1eEMAAAAAdXJuOm1wZWc6aGV2YzoyMDE1OmF1eGlkOjEAAAAAH2lwbWEAAAAAAAAAAgABBIECBIMAAgWFAgaHgwAAABppcmVmAAAAAAAAAA5hdXhsAAIAAQABAAAAVm1kYXQAAAAnKAGvEyExlvhOUKeW/WMCzQyVTFq5T6Vz3QpQk3J+uP7yh5PFYoLgAAAAHygBriZCSiTn1w3//h8LF2FVc1OybCBiRCkSgGP19K4=';
      const fileId = crypto.randomUUID();

      await expect(s3Client.uploadImage(base64Heif, fileId)).rejects.toThrow(
        new UnsupportedMediaTypeError(
          'image/heic images aren’t supported. Please provide one of: AVIF, GIF, JPEG, PNG, SVG, WebP',
        ),
      );
    });

    it('should generate a unique file name when no file ID is provided', async () => {
      const spy = jest.spyOn(getUniqueFileNameModule, 'getUniqueFileName');

      await s3Client.uploadImage(base64Gif, '');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith();
    });

    it('should not generate any file name when provided a file ID', async () => {
      const fileId = crypto.randomUUID();
      const spy = jest.spyOn(getUniqueFileNameModule, 'getUniqueFileName');

      await s3Client.uploadImage(base64Gif, fileId);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should abort if file already exists, if overwrite is prohibited', async () => {
      // Mock private instance method `S3Client#checkIfFileExists` to report a file conflict
      jest.spyOn(S3Client.prototype as any, 'checkIfFileExists').mockResolvedValue(true);

      const fileId = crypto.randomUUID();
      const expectedError = new ConflictError(
        `File dev_uploads/images/${fileId}.gif already exists on S3, overwrite is not allowed`,
      );

      await expect(s3Client.uploadImage(base64Gif, fileId, false)).rejects.toThrow(expectedError);
    });

    it('should not abort if file already exists and overwrite is allowed', async () => {
      // Mock private instance method `S3Client#checkIfFileExists` to report a file conflict
      jest.spyOn(S3Client.prototype as any, 'checkIfFileExists').mockResolvedValue(true);

      const fileId = crypto.randomUUID();

      await expect(s3Client.uploadImage(base64Gif, fileId, true)).resolves.not.toThrow(
        ConflictError,
      );
    });
  });
});
