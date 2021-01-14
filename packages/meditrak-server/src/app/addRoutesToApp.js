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
  // == TODO: Remove generic handlers ==
  addRecord,
  deleteRecord,
  editRecord,
  getRecord,
  // ====
  authenticate,
  countChanges,
  createCountries,
  createDataSources,
  createDisasters,
  createFeedItems,
  createPermissionGroups,
  createUserEntityPermissions,
  deleteAnswers,
  deleteDashboardGroups,
  deleteDashboardReports,
  deleteDataSources,
  deleteDisasters,
  deleteFeedItems,
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
  editDashboardGroups,
  editDashboardReports,
  editDataSources,
  editDisasters,
  editFeedItems,
  editOptions,
  editOptionSets,
  editQuestions,
  editSurveys,
  editMapOverlays,
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
  getDashboardReports,
  getDashboardGroups,
  getDataSources,
  getEntities,
  getGeographicalAreas,
  getFeedItems,
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
  pruneChanges,
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

export function addRoutesToApp(app) {
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

  app.use(extractApiVersion);

  /**
   * Attach authentication to each endpoint
   */
  app.use(authenticationMiddleware);

  /**
   * Log every request in the api hit table
   */
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
   */
  app.get('(/v[0-9]+)?/changes/count', countChanges);
  app.get('(/v[0-9]+)/export/surveyResponses', exportSurveyResponses);
  app.get('(/v[0-9]+)/export/surveyResponses/:surveyResponseId', exportSurveyResponses);
  app.get('(/v[0-9]+)/export/surveys', exportSurveys);
  app.get('(/v[0-9]+)/export/surveys/:surveyId', exportSurveys);
  app.get('(/v[0-9]+)?/changes', getChanges);
  app.get('(/v[0-9]+)/socialFeed', getSocialFeed);
  app.get('(/v[0-9]+)/me', getUser);
  app.get('(/v[0-9]+)/me/rewards', getUserRewards);
  app.get('(/v[0-9]+)/me/countries', getCountryAccessList);
  app.get('(/v[0-9]+)/answers/:recordId?', getAnswers);
  app.get('(/v[0-9]+)/disasters/:recordId?', getDisasters);
  app.get('(/v[0-9]+)/dashboardReports/:recordId?', getDashboardReports);
  app.get('(/v[0-9]+)/dashboardGroups/:recordId?', getDashboardGroups);
  app.get('(/v[0-9]+)/feedItems/:recordId?', getFeedItems);
  app.get('(/v[0-9]+)/mapOverlays/:recordId?', getMapOverlays);
  app.get('(/v[0-9]+)/surveys/:recordId?', getSurveys);
  app.get('(/v[0-9]+)/countries/:parentRecordId/surveys', getSurveys);
  app.get('(/v[0-9]+)/countries/:parentRecordId/entities', getEntities);
  app.get('(/v[0-9]+)/surveyGroups/:recordId?', getSurveyGroups);
  app.get('(/v[0-9]+)/surveyResponses/:parentRecordId/answers', getAnswers);
  app.get('(/v[0-9]+)/surveyResponses/:recordId?', getSurveyResponses);
  app.get('(/v[0-9]+)/surveyScreenComponents/:recordId?', getSurveyScreenComponents);
  app.get('(/v[0-9]+)/surveys/:parentRecordId?/surveyScreenComponents', getSurveyScreenComponents);
  app.get('(/v[0-9]+)/questions/:recordId?', getQuestions);
  app.get('(/v[0-9]+)/permissionGroups/:recordId?', getPermissionGroups);
  app.get('(/v[0-9]+)/options/:recordId?', getOptions);
  app.get('(/v[0-9]+)/optionSets/:recordId?', getOptionSets);
  app.get('(/v[0-9]+)/optionSets/:parentRecordId/options', getOptions);
  app.get('(/v[0-9]+)/projects/:recordId?', getProjects);
  app.get('(/v[0-9]+)/users/:recordId?', getUserAccounts);
  app.get('(/v[0-9]+)/userEntityPermissions/:recordId?', getUserEntityPermissions);
  app.get(
    '(/v[0-9]+)/users/:parentRecordId/userEntityPermissions/:recordId?',
    getUserEntityPermissions,
  );
  app.get('(/v[0-9]+)/accessRequests/:recordId?', getAccessRequests);
  app.get('(/v[0-9]+)/dataSources/:recordId?', getDataSources);
  app.get('(/v[0-9]+)/dataSources/:parentRecordId/dataSources', getDataSources);
  app.get('(/v[0-9]+)/entities/:recordId?', getEntities);
  app.get('(/v[0-9]+)/entities/:parentRecordId/surveyResponses', getSurveyResponses);
  app.get('(/v[0-9]+)/countries/:recordId?', getCountries);
  app.get('(/v[0-9]+)/clinics/:recordId?', getClinics);
  app.get('(/v[0-9]+)/facilities/:recordId?', getClinics);
  app.get('(/v[0-9]+)/geographicalAreas/:recordId?', getGeographicalAreas);

  // TODO: Remove generic handlers when all endpoints are implemented
  app.get('(/v[0-9]+)/:resource', getRecord);
  app.get('(/v[0-9]+)/:parentResource/:parentRecordId/:resource', getRecord);

  /**
   * POST routes
   */
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
  app.post('(/v[0-9]+)/import/disasters', upload.single('disasters'), importDisaster);
  app.post('(/v[0-9]+)/import/users', upload.single('users'), importUsers);
  app.post('(/v[0-9]+)/import/optionSets', upload.single('optionSets'), importOptionSets);
  app.post('(/v[0-9]+)?/user', registerUserAccount); // used for user registration on tupaia.org etc.
  app.post('(/v[0-9]+)?/users', createUserAccount); // used by admin panel to directly create users
  app.post('(/v[0-9]+)?/userEntityPermissions', createUserEntityPermissions);
  app.post('(/v[0-9]+)/me/requestCountryAccess', requestCountryAccess);
  app.post('(/v[0-9]+)/me/changePassword', changePassword);
  app.post('(/v[0-9]+)/surveyResponse', surveyResponse); // used by mSupply to directly submit data
  app.post('(/v[0-9]+)/surveyResponses', surveyResponse);
  app.post('(/v[0-9]+)/countries', createCountries);
  app.post('(/v[0-9]+)/dataSources', createDataSources);
  app.post('(/v[0-9]+)/disasters', createDisasters);
  app.post('(/v[0-9]+)/feedItems', createFeedItems);
  app.post('(/v[0-9]+)/permissionGroups', createPermissionGroups);

  // TODO: Remove generic handlers when all endpoints are implemented
  app.post('(/v[0-9]+)/:resource', addRecord);
  app.post('(/v[0-9]+)/:parentResource/:parentRecordId/:resource', addRecord);

  /**
   * PUT routes
   */
  app.put('(/v[0-9]+)/users/:recordId', editUserAccounts);
  app.put('(/v[0-9]+)/userEntityPermissions/:recordId', editUserEntityPermissions);
  app.put('(/v[0-9]+)/accessRequests/:recordId', editAccessRequests);
  app.put('(/v[0-9]+)/surveys/:recordId', editSurveys);
  app.put('(/v[0-9]+)/surveyResponses/:recordId', editSurveyResponses);
  app.put('(/v[0-9]+)/surveyScreenComponents/:recordId', editSurveyScreenComponents);
  app.put('(/v[0-9]+)/answers/:recordId', editAnswers);
  app.put('(/v[0-9]+)/surveyResponses/:parentRecordId/answers/:recordId', editAnswers);
  app.put('(/v[0-9]+)/dataSources/:recordId', editDataSources);
  app.put('(/v[0-9]+)/disasters/:recordId', editDisasters);
  app.put('(/v[0-9]+)/feedItems/:recordId', editFeedItems);
  app.put('(/v[0-9]+)/options/:recordId', editOptions);
  app.put('(/v[0-9]+)/optionSets/:recordId', editOptionSets);
  app.put('(/v[0-9]+)/questions/:recordId', editQuestions);
  app.put('(/v[0-9]+)/dashboardGroups/:recordId', editDashboardGroups);
  app.put('(/v[0-9]+)/dashboardReports/:recordId', editDashboardReports);
  app.put('(/v[0-9]+)/mapOverlays/:recordId', editMapOverlays);
  app.put('(/v[0-9]+)/me', editUser);

  // TODO: Remove generic handlers when all endpoints are implemented
  app.put('(/v[0-9]+)/:parentResource/:parentRecordId/:resource/:recordId', editRecord);
  app.put('(/v[0-9]+)/:resource/:recordId', editRecord);

  /**
   * DELETE routes
   */
  app.delete('(/v[0-9]+)/userEntityPermissions/:recordId', deleteUserEntityPermissions);
  app.delete('(/v[0-9]+)/surveys/:recordId', deleteSurveys);
  app.delete('(/v[0-9]+)/surveyResponses/:recordId', deleteSurveyResponses);
  app.delete('(/v[0-9]+)/surveyScreenComponents/:recordId', deleteSurveyScreenComponents);
  app.delete('(/v[0-9]+)/answers/:recordId', deleteAnswers);
  app.delete('(/v[0-9]+)/surveyResponses/:parentRecordId/answers/:recordId', deleteAnswers);
  app.delete('(/v[0-9]+)/dataSources/:recordId', deleteDataSources);
  app.delete('(/v[0-9]+)/disasters/:recordId', deleteDisasters);
  app.delete('(/v[0-9]+)/feedItems/:recordId', deleteFeedItems);
  app.delete('(/v[0-9]+)/options/:recordId', deleteOptions);
  app.delete('(/v[0-9]+)/optionSets/:recordId', deleteOptionSets);
  app.delete('(/v[0-9]+)/questions/:recordId', deleteQuestions);
  app.delete('(/v[0-9]+)/dashboardGroups/:recordId', deleteDashboardGroups);
  app.delete('(/v[0-9]+)/dashboardReports/:recordId', deleteDashboardReports);
  app.delete('(/v[0-9]+)/mapOverlays/:recordId', deleteMapOverlays);
  // TODO: Remove the generic handlers once all DELETE endpoints have specific handlers
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
