import express from 'express';
import multer from 'multer';

import { emailAfterTimeout } from '@tupaia/server-boilerplate';
import { getTempDirectory } from '@tupaia/server-utils';
import { catchAsyncErrors } from '../middleware';
import { importDataElementDataServices } from './importDataElementDataServices';
import { importDataElements } from './importDataElements';
import { constructEntityImportEmail, importEntities } from './importEntities';
import { importEntityPolygons } from './importEntityPolygons';
import { importOptionSets } from './importOptionSets';
import { importStriveLabResults } from './importStriveLabResults';
import { constructImportEmail, importSurveyResponses } from './importSurveyResponses';
import { importUserPermissions } from './importUserPermissions';
import { importUsers } from './importUsers';

// create upload handler
const upload = multer({
  storage: multer.diskStorage({
    destination: getTempDirectory('uploads'),
    filename: (req, file, callback) => {
      callback(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

const importRoutes = express.Router();

importRoutes.post(
  '/entities',
  emailAfterTimeout(constructEntityImportEmail),
  upload.single('entities'),
  catchAsyncErrors(importEntities),
);
importRoutes.post(
  '/entityPolygons',
  upload.single('entityPolygons'),
  catchAsyncErrors(importEntityPolygons),
);
importRoutes.post(
  '/dataElements',
  upload.single('dataElements'),
  catchAsyncErrors(importDataElements),
);
importRoutes.post(
  '/striveLabResults',
  upload.single('striveLabResults'),
  catchAsyncErrors(importStriveLabResults),
);
importRoutes.post(
  '/surveyResponses',
  emailAfterTimeout(constructImportEmail),
  upload.single('surveyResponses'),
  catchAsyncErrors(importSurveyResponses),
);
importRoutes.post('/users', upload.single('users'), catchAsyncErrors(importUsers));
importRoutes.post('/optionSets', upload.single('optionSets'), catchAsyncErrors(importOptionSets));
importRoutes.post(
  '/dataElementDataServices',
  upload.single('dataElementDataServices'),
  catchAsyncErrors(importDataElementDataServices),
);
importRoutes.post(
  '/userPermissions',
  upload.single('userPermissions'),
  catchAsyncErrors(importUserPermissions),
);

export { importRoutes };
