import multer from 'multer';

import { getTempDirectory, getUniqueUploadFileName } from '@tupaia/server-utils';

/**
 * Multer storage for all file uploads. Files are named by the server; the client-supplied name
 * remains available as `file.originalname`.
 */
export const uploadStorage = multer.diskStorage({
  destination: getTempDirectory('uploads'),
  filename: (_req, file, callback) => {
    callback(null, getUniqueUploadFileName(file.originalname));
  },
});
