import multer from 'multer';

import { getUniqueUploadFileName } from '@tupaia/server-utils';

export const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (_req, file, callback) => {
      callback(null, getUniqueUploadFileName(file.originalname));
    },
  }),
});
