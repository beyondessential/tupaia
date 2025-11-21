import { S3, S3Client } from '../../s3';
import * as getUniqueFileNameModule from '../../s3/getUniqueFileName';

// Picked up from .env files when a deployed server depends on @tupaia/server-utils, but not when
// running this test suite directly
process.env.AWS_REGION ||= 'ap-southeast-2';

/**
 * `S3Client#upload` creates an `Upload` instance; but this test suite doesn’t
 * actually upload files.
 */
jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({ Location: 'https://s3.tupaia.org/uploads/test.webp' }),
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

    it('should throw if file is not an image', () => {});

    it('should throw if image type is not supported', () => {});

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

    it('should abort if file already exists, if overwrite is prohibited', () => {});

    it('should not abort file already exists and overwrite is allowed', () => {});
  });
});
