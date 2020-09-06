/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import multer from 'multer';
import { InternalServerError, UnsupportedApiVersionError } from '@tupaia/utils';

import { logApiRequest } from './logApiRequest';

import { authenticationMiddleware } from '../auth';

import { ensurePermissionCheck } from '../permissions';

import routes from '../routes';

const {
  authenticate,
  countChanges,
  deleteRecord,
  editRecord,
  exportSurveyResponses,
  exportSurveys,
  getChanges,
  getAnswers,
  getDisasters,
  getSurveyGroups,
  getQuestions,
  getPermissionGroups,
  getOptions,
  getOptionSets,
  getSocialFeed,
  importEntities,
  importStriveLabResults,
  importSurveys,
  importUsers,
  importOptionSets,
  postChanges,
  pruneChanges,
  importSurveyResponses,
  createUser,
  changePassword,
  requestCountryAccess,
  addRecord,
  getUserRewards,
  requestPasswordReset,
  requestResendEmail,
  getCountryAccessList,
  surveyResponse,
  importDisaster,
  verifyEmail,
} = routes;

const MINIMUM_API_VERSION = 2;

export function addRoutesToApp(app) {
  /**
   * Create upload handler
   **/
  const upload = multer({
    storage: multer.diskStorage({
      destination: './uploads/',
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
      },
    }),
  });

  app.use(extractApiVersion);

  /**
   * Attach authentication to each endpoint
   **/
  app.use(authenticationMiddleware);

  /**
   * Log every request in the api hit table
   **/
  app.use(logApiRequest);

  /**
   * Attach authorisation middleware before route handlers
   */
  app.use(ensurePermissionCheck);

  /**
   * Legacy routes to be eventually removed
   */
  app.post(
    '(/v[0-9]+)?/user/:userId/requestCountryAccess', // TODO not used from app version 1.7.93. Once usage stops, remove
    requestCountryAccess,
  );
  app.post('(/v[0-9]+)?/changes/prune', pruneChanges); // TODO not used from app version 1.5.68. Once usage stops, remove

  /**
   * GET routes
   **/
  app.get('(/v[0-9]+)?/changes/count', countChanges);
  app.get('(/v[0-9]+)/export/surveyResponses', exportSurveyResponses);
  app.get('(/v[0-9]+)/export/surveyResponse/:surveyResponseId', exportSurveyResponses);
  app.get('(/v[0-9]+)/export/surveys', exportSurveys);
  app.get('(/v[0-9]+)/export/survey/:surveyId', exportSurveys);
  app.get('(/v[0-9]+)?/changes', getChanges);
  app.get('(/v[0-9]+)/socialFeed', getSocialFeed);
  app.get('(/v[0-9]+)/me/rewards', getUserRewards);
  app.get('(/v[0-9]+)/me/countries', getCountryAccessList);
  app.get('(/v[0-9]+)/answer/:recordId?', getAnswers);
  app.get('(/v[0-9]+)/disaster/:recordId?', getDisasters);
  app.get('(/v[0-9]+)/surveyGroups/:recordId?', getSurveyGroups);
  app.get('(/v[0-9]+)/questions/:recordId?', getQuestions);
  app.get('(/v[0-9]+)/permissionGroups/:recordId?', getPermissionGroups);
  app.get('(/v[0-9]+)/options/:recordId?', getOptions);
  app.get('(/v[0-9]+)/optionSets/:recordId?', getOptionSets);

  /**
   * POST routes
   **/
  app.post('(/v[0-9]+)?/auth', authenticate);
  app.post('(/v[0-9]+)?/auth/resetPassword', requestPasswordReset);
  app.post('(/v[0-9]+)?/auth/resendEmail', requestResendEmail);
  app.post('(/v[0-9]+)?/changes', postChanges);
  app.post('(/v[0-9]+)/import/entities', upload.single('entities'), importEntities);
  app.post('(/v[0-9]+)/auth/verifyEmail', verifyEmail);
  app.post(
    '(/v[0-9]+)/import/striveLabResults',
    upload.single('striveLabResults'),
    importStriveLabResults,
  );
  app.post('(/v[0-9]+)/import/surveys', upload.single('surveys'), importSurveys);
  app.post(
    '(/v[0-9]+)/import/surveyResponses',
    upload.single('surveyResponses'),
    importSurveyResponses,
  );
  app.post('(/v[0-9]+)/import/disaster', upload.single('disaster'), importDisaster);
  app.post('(/v[0-9]+)/import/users', upload.single('users'), importUsers);
  app.post('(/v[0-9]+)/import/optionSets', upload.single('optionSets'), importOptionSets);
  app.post('(/v[0-9]+)?/user', createUser);
  app.post('(/v[0-9]+)/me/requestCountryAccess', requestCountryAccess);
  app.post('(/v[0-9]+)/me/changePassword', changePassword);
  app.post('(/v[0-9]+)/surveyResponse', surveyResponse);
  app.post('(/v[0-9]+)/:resource', addRecord);
  app.post('(/v[0-9]+)/:parentResource/:parentRecordId/:resource', addRecord);

  /**
   * PUT routes
   */
  app.put('(/v[0-9]+)/:parentResource/:parentRecordId/:resource/:id', editRecord);
  app.put('(/v[0-9]+)/:resource/:id', editRecord);

  /**
   * DELETE routes
   **/
  app.delete('(/v[0-9]+)/:parentResource/:parentRecordId/:resource/:recordId', deleteRecord);
  app.delete('(/v[0-9]+)/:resource/:recordId', deleteRecord);

  /**
   * Handle errors
   */
  app.use(handleError);
}

const extractApiVersion = (req, res, next) => {
  if (!req.path.startsWith('/v')) {
    // A version of the app that should be on v2 but missing the version section of the url
    req.version = 2;
    req.endpoint = req.path;
  } else {
    const secondSlashIndex = req.path.indexOf('/', 2);
    req.version = parseFloat(req.path.substring(2, secondSlashIndex));
    req.endpoint = req.path.substring(secondSlashIndex);
  }
  if (!req.version || req.version < MINIMUM_API_VERSION) {
    throw new UnsupportedApiVersionError();
  }
  next();
};

const handleError = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const { database, apiRequestLogId } = req;
  let error = err;
  if (!error.respond) {
    error = new InternalServerError(err);
  }
  if (database) {
    database.create('error_log', {
      message: error.message,
      type: error.constructor.name,
      api_request_log_id: apiRequestLogId,
    });
  }
  error.respond(res);
};
