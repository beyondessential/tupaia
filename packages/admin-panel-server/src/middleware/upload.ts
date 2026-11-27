import multer from 'multer';

import { uploadStorage } from '@tupaia/server-utils';

export const upload = multer({ storage: uploadStorage });
