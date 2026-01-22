import express from 'express';

import { catchAsyncErrors, handleError, logApiRequest, multipartJson } from './middleware';

import { allowNoPermissions, ensurePermissionCheck } from '../permissions';
import { useRouteHandler } from './RouteHandler';

import { exportRoutes } from './export';
import { importRoutes } from './import';
import { authenticate } from './authenticate';
import {
  countChanges,
  changesMetadata,
  getChanges,
  getSocialFeed,
  getUserRewards,
  postChanges,
} from './meditrakApp';
import { BESAdminCreateHandler, TupaiaAdminCreateHandler } from './CreateHandler';
import { BESAdminDeleteHandler } from './DeleteHandler';
import { BESAdminEditHandler } from './EditHandler';
import { BESAdminGETHandler, TupaiaAdminGETHandler } from './GETHandler';
import { GETCountries } from './GETCountries';
import { GETClinics } from './GETClinics';
import { GETDataElements, EditDataElements, DeleteDataElements } from './dataElements';
import { GETDataGroups, EditDataGroups, DeleteDataGroups } from './dataGroups';
import { GETDataTables, CreateDataTables, EditDataTables } from './dataTables';
import { GETFeedItems, EditFeedItems, CreateFeedItems } from './feedItems';
import { GETGeographicalAreas } from './GETGeographicalAreas';
import { GETSurveyGroups } from './GETSurveyGroups';
import { DeleteQuestions, EditQuestions, GETQuestions } from './questions';
import { GETPermissionGroups, CreatePermissionGroup } from './permissionGroups';
import { DeleteOptions, EditOptions, GETOptions } from './options';
import { DeleteOptionSets, EditOptionSets, GETOptionSets } from './optionSets';
import { GETAnswers } from './answers';
import { CreateSurvey, DeleteSurveys, EditSurvey, GETSurveys } from './surveys';
import { DeleteDashboardItem, EditDashboardItem, GETDashboardItems } from './dashboardItems';
import { CreateDashboard, DeleteDashboard, EditDashboard, GETDashboards } from './dashboards';
import { CreateProject, EditProject, GETProjects } from './projects';
import {
  DeleteDashboardRelation,
  EditDashboardRelation,
  CreateDashboardRelation,
  GETDashboardRelations,
} from './dashboardRelations';
import {
  GETDashboardVisualisations,
  CreateDashboardVisualisation,
  EditDashboardVisualisation,
} from './dashboardVisualisations';
import { GETEntityRelations } from './entityRelations';
import { DeleteLegacyReport, EditLegacyReport, GETLegacyReports } from './legacyReports';
import { DeleteMapOverlays, EditMapOverlays, GETMapOverlays } from './mapOverlays';
import {
  DeleteMapOverlayGroups,
  EditMapOverlayGroups,
  GETMapOverlayGroups,
  CreateMapOverlayGroups,
} from './mapOverlayGroups';
import {
  DeleteMapOverlayGroupRelations,
  EditMapOverlayGroupRelations,
  GETMapOverlayGroupRelations,
  CreateMapOverlayGroupRelation,
} from './mapOverlayGroupRelations';
import {
  DeleteSurveyResponses,
  GETSurveyResponses,
  SubmitSurveyResponses,
  ResubmitSurveyResponse,
  EditSurveyResponse,
} from './surveyResponses';
import {
  DeleteSurveyScreenComponents,
  EditSurveyScreenComponents,
  GETSurveyScreenComponents,
} from './surveyScreenComponents';
import {
  CreateUserAccounts,
  RegisterUserAccounts,
  EditUserAccounts,
  GETUserAccounts,
  GETUserForMe,
  EditUserForMe,
} from './userAccounts';
import {
  CreateUserEntityPermissions,
  DeleteUserEntityPermissions,
  EditUserEntityPermissions,
  GETUserEntityPermissions,
} from './userEntityPermissions';
import { EditEntity, GETEntities, DeleteEntity } from './entities';
import { GetEntityTypes, CreateEntityType } from './entityTypes';
import { EditAccessRequests, GETAccessRequests } from './accessRequests';
import { changePassword } from './changePassword';
import { deleteAccount } from './deleteAccount';
import { requestCountryAccess } from './requestCountryAccess';
import { requestPasswordReset } from './requestPasswordReset';
import { getCountryAccessList } from './getCountryAccessList';
import { verifyEmail, requestResendEmail } from './verifyEmail';
import { GETReports } from './reports';
import { GETDataElementDataGroups } from './dataElementDataGroups';
import {
  CreateMapOverlayVisualisation,
  EditMapOverlayVisualisation,
  GETMapOverlayVisualisations,
} from './mapOverlayVisualisations';
import {
  GETSyncGroups,
  EditSyncGroups,
  CreateSyncGroups,
  DeleteSyncGroups,
  GETSyncGroupLogs,
  GETSyncGroupLogsCount,
  ManuallySyncSyncGroup,
} from './syncGroups';
import { POSTUpdateUserFavouriteDashboardItem } from './userFavouriteDashboardItem';
import {
  GETExternalDatabaseConnections,
  TestExternalDatabaseConnection,
} from './externalDatabaseConnections';
import {
  CreateLandingPage,
  DeleteLandingPage,
  EditLandingPage,
  GETLandingPages,
} from './landingPages';
import { DownloadFiles } from './DownloadFiles';
import { suggestSurveyCode } from './suggestSurveyCode';
import {
  CreateDashboardMailingList,
  DeleteDashboardMailingList,
  EditDashboardMailingList,
  GETDashboardMailingLists,
} from './dashboardMailingLists';
import {
  CreateDashboardMailingListEntry,
  DeleteDashboardMailingListEntry,
  EditDashboardMailingListEntry,
  GETDashboardMailingListEntries,
} from './dashboardMailingListEntries';
import { EditEntityHierarchy, GETEntityHierarchy } from './entityHierarchy';
import { CreateTask, EditTask, GETTasks } from './tasks';
import { CreateTaskComment, GETTaskComments } from './taskComments';
import { GetDataTableTypes } from './dataTableTypes';

// quick and dirty permission wrapper for open endpoints
const allowAnyone = routeHandler => (req, res, next) => {
  req.assertPermissions(allowNoPermissions);
  catchAsyncErrors(routeHandler)(req, res, next);
};

/**
 * Set up apiV2 routes
 */
const apiV2 = express.Router();

apiV2.use(logApiRequest); // log every request to the api_request_log table

apiV2.use(ensurePermissionCheck); // ensure permissions checking is handled by each endpoint

/**
 * /export and /import routes
 */
apiV2.use('/export', exportRoutes);
apiV2.use('/import', importRoutes);

/**
 * GET routes
 */
apiV2.get('/changes/count', catchAsyncErrors(countChanges));
apiV2.get('/changes/metadata', catchAsyncErrors(changesMetadata));
apiV2.get('/changes', catchAsyncErrors(getChanges));
apiV2.get('/downloadFiles', useRouteHandler(DownloadFiles));
apiV2.get('/socialFeed', catchAsyncErrors(getSocialFeed));
apiV2.get('/me', useRouteHandler(GETUserForMe));
apiV2.get('/me/rewards', allowAnyone(getUserRewards));
apiV2.get('/me/countries', allowAnyone(getCountryAccessList));
apiV2.get('/answers/:recordId?', useRouteHandler(GETAnswers));
apiV2.get('/dashboards/:recordId?', useRouteHandler(GETDashboards));
apiV2.get('/dashboards/:parentRecordId/dashboardRelations', useRouteHandler(GETDashboardRelations));
apiV2.get(
  '/dashboardItems/:parentRecordId/dashboardRelations',
  useRouteHandler(GETDashboardRelations),
);
apiV2.get('/dashboardItems/:recordId?', useRouteHandler(GETDashboardItems));
apiV2.get('/dashboardMailingLists/:recordId?', useRouteHandler(GETDashboardMailingLists));
apiV2.get(
  '/dashboardMailingLists/:parentRecordId/dashboardMailingListEntries',
  useRouteHandler(GETDashboardMailingListEntries),
);
apiV2.get(
  '/dashboardMailingListEntries/:recordId?',
  useRouteHandler(GETDashboardMailingListEntries),
);
apiV2.get('/dashboardRelations/:recordId?', useRouteHandler(GETDashboardRelations));
apiV2.get('/dashboardVisualisations/:recordId?', useRouteHandler(GETDashboardVisualisations));
apiV2.get('/mapOverlayVisualisations/:recordId?', useRouteHandler(GETMapOverlayVisualisations));
apiV2.get(
  '/mapOverlays/:parentRecordId/mapOverlayGroupRelations',
  useRouteHandler(GETMapOverlayGroupRelations),
);
apiV2.get('/legacyReports/:recordId?', useRouteHandler(GETLegacyReports));
apiV2.get('/indicators/:recordId?', useRouteHandler(BESAdminGETHandler));
apiV2.get('/feedItems/:recordId?', useRouteHandler(GETFeedItems));
apiV2.get('/mapOverlays/:recordId?', useRouteHandler(GETMapOverlays));
apiV2.get('/mapOverlayGroups/:recordId?', useRouteHandler(GETMapOverlayGroups));
apiV2.get(
  '/mapOverlayGroups/:parentRecordId/mapOverlayGroupRelations',
  useRouteHandler(GETMapOverlayGroupRelations),
);
apiV2.get('/mapOverlayGroupRelations/:recordId?', useRouteHandler(GETMapOverlayGroupRelations));
apiV2.get('/surveys/:recordId?', useRouteHandler(GETSurveys));
apiV2.get('/countries/:parentRecordId/surveys', useRouteHandler(GETSurveys));
apiV2.get('/countries/:parentRecordId/entities', useRouteHandler(GETEntities));
apiV2.get('/entityTypes/:recordId?', useRouteHandler(GetEntityTypes));
apiV2.get('/surveyGroups/:recordId?', useRouteHandler(GETSurveyGroups));
apiV2.get('/surveyResponses/:parentRecordId/answers', useRouteHandler(GETAnswers));
apiV2.get('/surveyResponses/:recordId?', useRouteHandler(GETSurveyResponses));
apiV2.get('/surveyScreenComponents/:recordId?', useRouteHandler(GETSurveyScreenComponents));
apiV2.get(
  '/surveys/:parentRecordId/surveyScreenComponents',
  useRouteHandler(GETSurveyScreenComponents),
);
apiV2.get('/questions/:recordId?', useRouteHandler(GETQuestions));
apiV2.get('/permissionGroups/:recordId?', useRouteHandler(GETPermissionGroups));
apiV2.get('/options/:recordId?', useRouteHandler(GETOptions));
apiV2.get('/optionSets/:recordId?', useRouteHandler(GETOptionSets));
apiV2.get('/optionSets/:parentRecordId/options', useRouteHandler(GETOptions));
apiV2.get('/projects/:recordId?', useRouteHandler(GETProjects));
apiV2.get('/users/:recordId?', useRouteHandler(GETUserAccounts));
apiV2.get('/users/:parentRecordId?/accessRequests/:recordId?', useRouteHandler(GETAccessRequests));
apiV2.get('/userEntityPermissions/:recordId?', useRouteHandler(GETUserEntityPermissions));
apiV2.get(
  '/users/:parentRecordId/userEntityPermissions/:recordId?',
  useRouteHandler(GETUserEntityPermissions),
);
apiV2.get('/accessRequests/:recordId?', useRouteHandler(GETAccessRequests));
apiV2.get('/dataElements/:recordId?', useRouteHandler(GETDataElements));
apiV2.get('/dataGroups/:parentRecordId/dataElements', useRouteHandler(GETDataElements));
apiV2.get('/dataGroups/:recordId?', useRouteHandler(GETDataGroups));
apiV2.get('/dataTables/:recordId?', useRouteHandler(GETDataTables));
apiV2.get('/dataTableTypes/:recordId?', useRouteHandler(GetDataTableTypes));
apiV2.get('/dataElementDataGroups', useRouteHandler(GETDataElementDataGroups));
apiV2.get('/entities/:recordId?', useRouteHandler(GETEntities));
apiV2.get('/entities/:parentRecordId/surveyResponses', useRouteHandler(GETSurveyResponses));
apiV2.get('/entityRelations/:recordId?', useRouteHandler(GETEntityRelations));
apiV2.get('/countries/:recordId?', useRouteHandler(GETCountries));
apiV2.get('/clinics/:recordId?', useRouteHandler(GETClinics));
apiV2.get('/facilities/:recordId?', useRouteHandler(GETClinics));
apiV2.get('/geographicalAreas/:recordId?', useRouteHandler(GETGeographicalAreas));
apiV2.get('/reports/:recordId?', useRouteHandler(GETReports));
apiV2.get('/dhisInstances/:recordId?', useRouteHandler(TupaiaAdminGETHandler));
apiV2.get('/supersetInstances/:recordId?', useRouteHandler(TupaiaAdminGETHandler));
apiV2.get('/dataServiceSyncGroups/:recordId?', useRouteHandler(GETSyncGroups));
apiV2.get('/dataServiceSyncGroups/:recordId/logs', useRouteHandler(GETSyncGroupLogs));
apiV2.get('/dataServiceSyncGroups/:recordId/logs/count', useRouteHandler(GETSyncGroupLogsCount));
apiV2.get('/dataElementDataServices/:recordId?', useRouteHandler(BESAdminGETHandler));
apiV2.get(
  '/externalDatabaseConnections/:recordId?',
  useRouteHandler(GETExternalDatabaseConnections),
);
apiV2.get(
  '/externalDatabaseConnections/:recordId/test',
  useRouteHandler(TestExternalDatabaseConnection),
);
apiV2.get('/entityHierarchy/:recordId?', useRouteHandler(GETEntityHierarchy));
apiV2.get('/landingPages/:recordId?', useRouteHandler(GETLandingPages));
apiV2.get('/suggestSurveyCode', catchAsyncErrors(suggestSurveyCode));
apiV2.get('/tasks/:recordId?', useRouteHandler(GETTasks));
apiV2.get('/tasks/:parentRecordId/taskComments', useRouteHandler(GETTaskComments));

/**
 * Semantically a GET, but mechanically a POST, to bypass `414 Request-URI Too Large` error by
 * putting params in request body.
 */
apiV2.post('/dashboardItems', useRouteHandler(GETDashboardItems));

/**
 * POST routes
 */
apiV2.post('/auth', catchAsyncErrors(authenticate));
apiV2.post('/auth/resetPassword', catchAsyncErrors(requestPasswordReset));
apiV2.post('/auth/resendEmail', catchAsyncErrors(requestResendEmail));
apiV2.post('/auth/verifyEmail', catchAsyncErrors(verifyEmail));
apiV2.post('/changes', catchAsyncErrors(postChanges));
apiV2.post('/user', useRouteHandler(RegisterUserAccounts)); // used for user registration on tupaia.org etc.
apiV2.post('/users', useRouteHandler(CreateUserAccounts)); // used by admin panel to directly create users
apiV2.post('/userEntityPermissions', useRouteHandler(CreateUserEntityPermissions));
apiV2.post('/me/requestCountryAccess', allowAnyone(requestCountryAccess));
apiV2.post('/me/deleteAccount', allowAnyone(deleteAccount));
apiV2.post('/me/changePassword', catchAsyncErrors(changePassword));
apiV2.post('/surveyResponse', useRouteHandler(SubmitSurveyResponses)); // used by mSupply to directly submit data
apiV2.post('/surveyResponses', useRouteHandler(SubmitSurveyResponses));
apiV2.post(
  '/surveyResponses/:recordId/resubmit',
  multipartJson(false),
  useRouteHandler(ResubmitSurveyResponse),
);
apiV2.post('/countries', useRouteHandler(BESAdminCreateHandler));
apiV2.post('/dataElements', useRouteHandler(TupaiaAdminCreateHandler));
apiV2.post('/dataGroups', useRouteHandler(BESAdminCreateHandler));
apiV2.post('/dataTables', useRouteHandler(CreateDataTables));
apiV2.post('/dashboards', useRouteHandler(CreateDashboard));
apiV2.post('/dashboardMailingLists', useRouteHandler(CreateDashboardMailingList));
apiV2.post('/dashboardMailingListEntries', useRouteHandler(CreateDashboardMailingListEntry));
apiV2.post('/entityTypes', useRouteHandler(CreateEntityType));
apiV2.post('/mapOverlayGroups', useRouteHandler(CreateMapOverlayGroups));
apiV2.post('/feedItems', useRouteHandler(CreateFeedItems));
apiV2.post('/indicators', useRouteHandler(BESAdminCreateHandler));
apiV2.post('/permissionGroups', useRouteHandler(CreatePermissionGroup));
apiV2.post('/dashboardRelations', useRouteHandler(CreateDashboardRelation));
apiV2.post('/dashboardVisualisations', useRouteHandler(CreateDashboardVisualisation));
apiV2.post('/mapOverlayVisualisations', useRouteHandler(CreateMapOverlayVisualisation));
apiV2.post('/mapOverlayGroupRelations', useRouteHandler(CreateMapOverlayGroupRelation));
apiV2.post('/userFavouriteDashboardItems', useRouteHandler(POSTUpdateUserFavouriteDashboardItem));
apiV2.post('/projects', useRouteHandler(CreateProject));
apiV2.post('/dataServiceSyncGroups', useRouteHandler(CreateSyncGroups));
apiV2.post('/dataServiceSyncGroups/:recordId/sync', useRouteHandler(ManuallySyncSyncGroup));
apiV2.post('/dataElementDataServices', useRouteHandler(BESAdminCreateHandler));
apiV2.post('/externalDatabaseConnections', useRouteHandler(BESAdminCreateHandler));
apiV2.post('/landingPages', useRouteHandler(CreateLandingPage));
apiV2.post('/surveys', multipartJson(), useRouteHandler(CreateSurvey));
apiV2.post('/dhisInstances', useRouteHandler(BESAdminCreateHandler));
apiV2.post('/supersetInstances', useRouteHandler(BESAdminCreateHandler));
apiV2.post('/tasks', useRouteHandler(CreateTask));
apiV2.post('/tasks/:parentRecordId/taskComments', useRouteHandler(CreateTaskComment));

/**
 * PUT routes
 */
apiV2.put('/users/:recordId', useRouteHandler(EditUserAccounts));
apiV2.put('/userEntityPermissions/:recordId', useRouteHandler(EditUserEntityPermissions));
apiV2.put('/accessRequests/:recordId?', useRouteHandler(EditAccessRequests));
apiV2.put('/surveyScreenComponents/:recordId', useRouteHandler(EditSurveyScreenComponents));
apiV2.put('/dataElements/:recordId', useRouteHandler(EditDataElements));
apiV2.put('/dataGroups/:recordId', useRouteHandler(EditDataGroups));
apiV2.put('/dataTables/:recordId', useRouteHandler(EditDataTables));
apiV2.put('/feedItems/:recordId', useRouteHandler(EditFeedItems));
apiV2.put('/options/:recordId', useRouteHandler(EditOptions));
apiV2.put('/optionSets/:recordId', useRouteHandler(EditOptionSets));
apiV2.put('/questions/:recordId', useRouteHandler(EditQuestions));
apiV2.put('/dashboards/:recordId', useRouteHandler(EditDashboard));
apiV2.put('/dashboardItems/:recordId', useRouteHandler(EditDashboardItem));
apiV2.put('/dashboardMailingLists/:recordId', useRouteHandler(EditDashboardMailingList));
apiV2.put('/dashboardMailingListEntries/:recordId', useRouteHandler(EditDashboardMailingListEntry));
apiV2.put('/dashboardRelations/:recordId', useRouteHandler(EditDashboardRelation));
apiV2.put('/dashboardVisualisations/:recordId', useRouteHandler(EditDashboardVisualisation));
apiV2.put('/mapOverlayVisualisations/:recordId', useRouteHandler(EditMapOverlayVisualisation));
apiV2.put('/legacyReports/:recordId', useRouteHandler(EditLegacyReport));
apiV2.put('/mapOverlays/:recordId', useRouteHandler(EditMapOverlays));
apiV2.put('/mapOverlayGroups/:recordId', useRouteHandler(EditMapOverlayGroups));
apiV2.put('/mapOverlayGroupRelations/:recordId', useRouteHandler(EditMapOverlayGroupRelations));
apiV2.put('/indicators/:recordId', useRouteHandler(BESAdminEditHandler));
apiV2.put('/projects/:recordId', useRouteHandler(EditProject));
apiV2.put('/entities/:recordId', useRouteHandler(EditEntity));
apiV2.put('/me', useRouteHandler(EditUserForMe));
apiV2.put('/dataServiceSyncGroups/:recordId', useRouteHandler(EditSyncGroups));
apiV2.put('/dataElementDataServices/:recordId', useRouteHandler(BESAdminEditHandler));
apiV2.put('/externalDatabaseConnections/:recordId', useRouteHandler(BESAdminEditHandler));
apiV2.put('/entityHierarchy/:recordId', useRouteHandler(EditEntityHierarchy));
apiV2.put('/landingPages/:recordId', useRouteHandler(EditLandingPage));
apiV2.put('/surveys/:recordId', multipartJson(), useRouteHandler(EditSurvey));
apiV2.put('/dhisInstances/:recordId', useRouteHandler(BESAdminEditHandler));
apiV2.put('/supersetInstances/:recordId', useRouteHandler(BESAdminEditHandler));
apiV2.put('/tasks/:recordId', useRouteHandler(EditTask));
apiV2.put('/surveyResponses/:recordId', useRouteHandler(EditSurveyResponse));

/**
 * DELETE routes
 */
apiV2.delete('/userEntityPermissions/:recordId', useRouteHandler(DeleteUserEntityPermissions));
apiV2.delete('/surveys/:recordId', useRouteHandler(DeleteSurveys));
apiV2.delete('/surveyResponses/:recordId', useRouteHandler(DeleteSurveyResponses));
apiV2.delete('/surveyScreenComponents/:recordId', useRouteHandler(DeleteSurveyScreenComponents));
apiV2.delete('/dataElements/:recordId', useRouteHandler(DeleteDataElements));
apiV2.delete('/dataGroups/:recordId', useRouteHandler(DeleteDataGroups));
apiV2.delete('/dataTables/:recordId', useRouteHandler(BESAdminDeleteHandler));
apiV2.delete('/entities/:recordId', useRouteHandler(DeleteEntity));
apiV2.delete('/feedItems/:recordId', useRouteHandler(BESAdminDeleteHandler));
apiV2.delete('/options/:recordId', useRouteHandler(DeleteOptions));
apiV2.delete('/optionSets/:recordId', useRouteHandler(DeleteOptionSets));
apiV2.delete('/questions/:recordId', useRouteHandler(DeleteQuestions));
apiV2.delete('/dashboards/:recordId', useRouteHandler(DeleteDashboard));
apiV2.delete('/dashboardItems/:recordId', useRouteHandler(DeleteDashboardItem));
apiV2.delete('/dashboardMailingLists/:recordId', useRouteHandler(DeleteDashboardMailingList));
apiV2.delete(
  '/dashboardMailingListEntries/:recordId',
  useRouteHandler(DeleteDashboardMailingListEntry),
);
apiV2.delete('/dashboardRelations/:recordId', useRouteHandler(DeleteDashboardRelation));
apiV2.delete('/legacyReports/:recordId', useRouteHandler(DeleteLegacyReport));
apiV2.delete('/mapOverlays/:recordId', useRouteHandler(DeleteMapOverlays));
apiV2.delete('/mapOverlayGroups/:recordId', useRouteHandler(DeleteMapOverlayGroups));
apiV2.delete(
  '/mapOverlayGroupRelations/:recordId',
  useRouteHandler(DeleteMapOverlayGroupRelations),
);
apiV2.delete('/indicators/:recordId', useRouteHandler(BESAdminDeleteHandler));
apiV2.delete('/dataServiceSyncGroups/:recordId', useRouteHandler(DeleteSyncGroups));
apiV2.delete('/dataElementDataServices/:recordId', useRouteHandler(BESAdminDeleteHandler));
apiV2.delete('/externalDatabaseConnections/:recordId', useRouteHandler(BESAdminDeleteHandler));
apiV2.delete('/landingPages/:recordId', useRouteHandler(DeleteLandingPage));
apiV2.delete('/dhisInstances/:recordId', useRouteHandler(BESAdminDeleteHandler));
apiV2.delete('/supersetInstances/:recordId', useRouteHandler(BESAdminDeleteHandler));

apiV2.use(handleError); // error handler must come last

export { apiV2 };
