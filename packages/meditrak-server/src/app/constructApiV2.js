/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import multer from 'multer';

import { InternalServerError, UnsupportedApiVersionError } from '@tupaia/utils';

import { logApiRequest } from './logApiRequest';
import { authenticationMiddleware } from '../auth';
import { ensurePermissionCheck } from '../permissions';
import routes from '../apiV2';

const {
  authenticate,
  countChanges,
  createCountries,
  createDataSources,
  createDisasters,
  createFeedItems,
  createIndicators,
  createPermissionGroups,
  createUserEntityPermissions,
  createDashboardRelations,
  deleteAnswers,
  deleteDashboards,
  deleteDashboardItems,
  deleteDashboardRelations,
  deleteLegacyReports,
  deleteDataSources,
  deleteDisasters,
  deleteFeedItems,
  deleteIndicators,
  deleteOptions,
  deleteOptionSets,
  deleteQuestions,
  deleteSurveys,
  deleteMapOverlays,
  deleteSurveyResponses,
  deleteSurveyScreenComponents,
  deleteUserEntityPermissions,
  editAccessRequests,
  editAnswers,
  editDashboards,
  editDashboardItems,
  editDashboardRelations,
  editLegacyReports,
  editDataSources,
  editDisasters,
  editFeedItems,
  editIndicators,
  editOptions,
  editOptionSets,
  editQuestions,
  editSurveys,
  editMapOverlays,
  editProjects,
  editSurveyResponses,
  editSurveyScreenComponents,
  editUserAccounts,
  editUserEntityPermissions,
  exportSurveyResponses,
  exportSurveys,
  getChanges,
  getAnswers,
  getClinics,
  getCountries,
  getDisasters,
  getDashboards,
  getDashboardItems,
  getDashboardRelations,
  getLegacyReports,
  getDataSources,
  getEntities,
  getGeographicalAreas,
  getFeedItems,
  getIndicators,
  getMapOverlays,
  getSurveys,
  getSurveyGroups,
  getSurveyResponses,
  getSurveyScreenComponents,
  getQuestions,
  getPermissionGroups,
  getOptions,
  getOptionSets,
  getProjects,
  getSocialFeed,
  getAccessRequests,
  getUserAccounts,
  getUserEntityPermissions,
  importEntities,
  importStriveLabResults,
  importSurveys,
  importUsers,
  importOptionSets,
  postChanges,
  importSurveyResponses,
  registerUserAccount,
  createUserAccount,
  editUser,
  changePassword,
  requestCountryAccess,
  getUserRewards,
  getUser,
  requestPasswordReset,
  requestResendEmail,
  getCountryAccessList,
  surveyResponse,
  importDisaster,
  verifyEmail,
} = routes;

const MINIMUM_API_VERSION = 2;

export const apiV2 = express.Router();

/**
 * Create upload handler
 */
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, callback) => {
      callback(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

apiV2.use(extractApiVersion);

/**
 * Attach authentication to each endpoint
 */
apiV2.use(authenticationMiddleware);

/**
 * Log every request in the api hit table
 */
apiV2.use(logApiRequest);

/**
 * Attach authorisation middleware before route handlers
 */
apiV2.use(ensurePermissionCheck);

/**
 * Legacy routes to be eventually removed
 */
apiV2.post(
  '/user/:userId/requestCountryAccess', // TODO not used from apiV2 version 1.7.93. Once usage stops, remove
  requestCountryAccess,
);

/**
 * GET routes
 */
apiV2.get('/changes/count', countChanges);
apiV2.get('/export/surveyResponses', exportSurveyResponses);
apiV2.get('/export/surveyResponses/:surveyResponseId', exportSurveyResponses);
apiV2.get('/export/surveys', exportSurveys);
apiV2.get('/export/surveys/:surveyId', exportSurveys);
apiV2.get('/changes', getChanges);
apiV2.get('/socialFeed', getSocialFeed);
apiV2.get('/me', getUser);
apiV2.get('/me/rewards', getUserRewards);
apiV2.get('/me/countries', getCountryAccessList);
apiV2.get('/answers/:recordId?', getAnswers);
apiV2.get('/disasters/:recordId?', getDisasters);
apiV2.get('/dashboards/:recordId?', getDashboards);
apiV2.get('/dashboards/:parentRecordId/dashboardRelations', getDashboardRelations);
apiV2.get('/dashboardItems/:recordId?', getDashboardItems);
apiV2.get('/dashboardRelations/:recordId?', getDashboardRelations);
apiV2.get('/legacyReports/:recordId?', getLegacyReports);
apiV2.get('/indicators/:recordId?', getIndicators);
apiV2.get('/feedItems/:recordId?', getFeedItems);
apiV2.get('/mapOverlays/:recordId?', getMapOverlays);
apiV2.get('/surveys/:recordId?', getSurveys);
apiV2.get('/countries/:parentRecordId/surveys', getSurveys);
apiV2.get('/countries/:parentRecordId/entities', getEntities);
apiV2.get('/surveyGroups/:recordId?', getSurveyGroups);
apiV2.get('/surveyResponses/:parentRecordId/answers', getAnswers);
apiV2.get('/surveyResponses/:recordId?', getSurveyResponses);
apiV2.get('/surveyScreenComponents/:recordId?', getSurveyScreenComponents);
apiV2.get('/surveys/:parentRecordId?/surveyScreenComponents', getSurveyScreenComponents);
apiV2.get('/questions/:recordId?', getQuestions);
apiV2.get('/permissionGroups/:recordId?', getPermissionGroups);
apiV2.get('/options/:recordId?', getOptions);
apiV2.get('/optionSets/:recordId?', getOptionSets);
apiV2.get('/optionSets/:parentRecordId/options', getOptions);
apiV2.get('/projects/:recordId?', getProjects);
apiV2.get('/users/:recordId?', getUserAccounts);
apiV2.get('/userEntityPermissions/:recordId?', getUserEntityPermissions);
apiV2.get('/users/:parentRecordId/userEntityPermissions/:recordId?', getUserEntityPermissions);
apiV2.get('/accessRequests/:recordId?', getAccessRequests);
apiV2.get('/dataSources/:recordId?', getDataSources);
apiV2.get('/dataSources/:parentRecordId/dataSources', getDataSources);
apiV2.get('/entities/:recordId?', getEntities);
apiV2.get('/entities/:parentRecordId/surveyResponses', getSurveyResponses);
apiV2.get('/countries/:recordId?', getCountries);
apiV2.get('/clinics/:recordId?', getClinics);
apiV2.get('/facilities/:recordId?', getClinics);
apiV2.get('/geographicalAreas/:recordId?', getGeographicalAreas);

/**
 * POST routes
 */
apiV2.post('/auth', authenticate);
apiV2.post('/auth/resetPassword', requestPasswordReset);
apiV2.post('/auth/resendEmail', requestResendEmail);
apiV2.post('/changes', postChanges);
apiV2.post('/import/entities', upload.single('entities'), importEntities);
apiV2.post('/auth/verifyEmail', verifyEmail);
apiV2.post('/import/striveLabResults', upload.single('striveLabResults'), importStriveLabResults);
apiV2.post('/import/surveys', upload.single('surveys'), importSurveys);
apiV2.post('/import/surveyResponses', upload.single('surveyResponses'), importSurveyResponses);
apiV2.post('/import/disasters', upload.single('disasters'), importDisaster);
apiV2.post('/import/users', upload.single('users'), importUsers);
apiV2.post('/import/optionSets', upload.single('optionSets'), importOptionSets);
apiV2.post('/user', registerUserAccount); // used for user registration on tupaia.org etc.
apiV2.post('/users', createUserAccount); // used by admin panel to directly create users
apiV2.post('/userEntityPermissions', createUserEntityPermissions);
apiV2.post('/me/requestCountryAccess', requestCountryAccess);
apiV2.post('/me/changePassword', changePassword);
apiV2.post('/surveyResponse', surveyResponse); // used by mSupply to directly submit data
apiV2.post('/surveyResponses', surveyResponse);
apiV2.post('/countries', createCountries);
apiV2.post('/dataSources', createDataSources);
apiV2.post('/disasters', createDisasters);
apiV2.post('/feedItems', createFeedItems);
apiV2.post('/indicators', createIndicators);
apiV2.post('/permissionGroups', createPermissionGroups);
apiV2.post('/dashboardRelations', createDashboardRelations);

/**
 * PUT routes
 */
apiV2.put('/users/:recordId', editUserAccounts);
apiV2.put('/userEntityPermissions/:recordId', editUserEntityPermissions);
apiV2.put('/accessRequests/:recordId', editAccessRequests);
apiV2.put('/surveys/:recordId', editSurveys);
apiV2.put('/surveyResponses/:recordId', editSurveyResponses);
apiV2.put('/surveyScreenComponents/:recordId', editSurveyScreenComponents);
apiV2.put('/answers/:recordId', editAnswers);
apiV2.put('/surveyResponses/:parentRecordId/answers/:recordId', editAnswers);
apiV2.put('/dataSources/:recordId', editDataSources);
apiV2.put('/disasters/:recordId', editDisasters);
apiV2.put('/feedItems/:recordId', editFeedItems);
apiV2.put('/options/:recordId', editOptions);
apiV2.put('/optionSets/:recordId', editOptionSets);
apiV2.put('/questions/:recordId', editQuestions);
apiV2.put('/dashboards/:recordId', editDashboards);
apiV2.put('/dashboardItems/:recordId', editDashboardItems);
apiV2.put('/dashboardRelations/:recordId', editDashboardRelations);
apiV2.put('/legacyReports/:recordId', editLegacyReports);
apiV2.put('/mapOverlays/:recordId', editMapOverlays);
apiV2.put('/indicators/:recordId', editIndicators);
apiV2.put('/projects/:recordId', editProjects);
apiV2.put('/me', editUser);

/**
 * DELETE routes
 */
apiV2.delete('/userEntityPermissions/:recordId', deleteUserEntityPermissions);
apiV2.delete('/surveys/:recordId', deleteSurveys);
apiV2.delete('/surveyResponses/:recordId', deleteSurveyResponses);
apiV2.delete('/surveyScreenComponents/:recordId', deleteSurveyScreenComponents);
apiV2.delete('/answers/:recordId', deleteAnswers);
apiV2.delete('/surveyResponses/:parentRecordId/answers/:recordId', deleteAnswers);
apiV2.delete('/dataSources/:recordId', deleteDataSources);
apiV2.delete('/disasters/:recordId', deleteDisasters);
apiV2.delete('/feedItems/:recordId', deleteFeedItems);
apiV2.delete('/options/:recordId', deleteOptions);
apiV2.delete('/optionSets/:recordId', deleteOptionSets);
apiV2.delete('/questions/:recordId', deleteQuestions);
apiV2.delete('/dashboards/:recordId', deleteDashboards);
apiV2.delete('/dashboardItems/:recordId', deleteDashboardItems);
apiV2.delete('/dashboardRelations/:recordId', deleteDashboardRelations);
apiV2.delete('/legacyReports/:recordId', deleteLegacyReports);
apiV2.delete('/mapOverlays/:recordId', deleteMapOverlays);
apiV2.delete('/indicators/:recordId', deleteIndicators);

/**
 * Handle errors
 */
apiV2.use(handleError);

const extractApiVersion = (req, res, next) => {
  if (!req.path.startsWith('/v')) {
    // A version of the apiV2 that should be on v2 but missing the version section of the url
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
