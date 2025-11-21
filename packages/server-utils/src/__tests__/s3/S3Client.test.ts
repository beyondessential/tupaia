import { S3, S3Client } from '../../s3';
import * as constantsModule from '../../s3/constants';
import * as getUniqueFileNameModule from '../../s3/getUniqueFileName';

/** 1×1 transparent GIF */
const base64Gif =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

// Mock dependencies
jest.mock('../../s3/getUniqueFileName');
jest.mock('../../s3/constants');
jest.mock('../../s3/S3');
jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({ Location: 'https://s3.example.com/test.jpg' }),
  })),
}));

describe('S3Client', () => {
  let s3Client: S3Client;
  let mockS3Instance: jest.Mocked<S3>;
  const mockGetS3ImageFilePath = jest.mocked(constantsModule.getS3ImageFilePath);

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup S3 mock
    mockS3Instance = {
      headObject: jest.fn().mockRejectedValue(new Error('Not found')), // File doesn't exist by default
      getObject: jest.fn(),
      deleteObject: jest.fn(),
    } as unknown as jest.Mocked<S3>;

    // Setup constants mocks
    mockGetS3ImageFilePath.mockReturnValue('dev_uploads/images/');

    // Create S3Client instance
    s3Client = new S3Client(mockS3Instance);
  });

  describe('uploadImage', () => {
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
