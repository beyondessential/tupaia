/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import multer from 'multer';
import { getTempDirectory } from '@tupaia/server-utils';
import { emailAfterTimeout } from '@tupaia/server-boilerplate';
import { catchAsyncErrors } from '../middleware';

import { importOptionSets } from './importOptionSets';
import { importEntities } from './importEntities';
import { importStriveLabResults } from './importStriveLabResults';
import { importUsers } from './importUsers';
import { importSurveyResponses, constructImportEmail } from './importSurveyResponses';
import { importDataElements } from './importDataElements';
import { importDataElementDataServices } from './importDataElementDataServices';
import { importUserPermissions } from './importUserPermissions';

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

importRoutes.post('/entities', upload.single('entities'), catchAsyncErrors(importEntities));
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
