/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import multer from 'multer';

import { catchAsyncErrors, emailAfterTimeout } from '../middleware';

import { importOptionSets } from './importOptionSets';
import { importEntities } from './importEntities';
import { importStriveLabResults } from './importStriveLabResults';
import { importSurveys } from './importSurveys';
import { importUsers } from './importUsers';
import { importSurveyResponses, constructImportEmail } from './importSurveyResponses';
import { importDisaster } from './importDisaster';
import { getTempDirectory } from '../../utilities';
import { importDataSources } from './importDataSources';

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
  '/dataSources',
  upload.single('dataSources'),
  catchAsyncErrors(importDataSources),
);
importRoutes.post(
  '/striveLabResults',
  upload.single('striveLabResults'),
  catchAsyncErrors(importStriveLabResults),
);
importRoutes.post('/surveys', upload.single('surveys'), catchAsyncErrors(importSurveys));
importRoutes.post(
  '/surveyResponses',
  emailAfterTimeout(constructImportEmail),
  upload.single('surveyResponses'),
  catchAsyncErrors(importSurveyResponses),
);
importRoutes.post('/disasters', upload.single('disasters'), catchAsyncErrors(importDisaster));
importRoutes.post('/users', upload.single('users'), catchAsyncErrors(importUsers));
importRoutes.post('/optionSets', upload.single('optionSets'), catchAsyncErrors(importOptionSets));

export { importRoutes };
