import multer from 'multer';

import { getTempDirectory } from './getTempDirectory';
import { getUniqueUploadFileName } from './getUniqueUploadFileName';

/**
 * Multer storage for all file uploads. Files are named by the server; the client-supplied name
 * remains available as `file.originalname`.
 */
export const uploadStorage = multer.diskStorage({
  // Resolved per upload (rather than at import) so merely importing this package doesn’t touch the
  // file system, and the directory is recreated if the OS has cleaned it up
  destination: (_req, _file, callback) => {
    let directory: string;
    try {
      directory = getTempDirectory('uploads');
    } catch (error) {
      // Multer calls this from a stream event handler, so a throw here would be an uncaught
      // exception rather than a failed request
      callback(error as Error, '');
      return;
    }
    callback(null, directory);
  },
  filename: (_req, file, callback) => {
    callback(null, getUniqueUploadFileName(file.originalname));
  },
});
