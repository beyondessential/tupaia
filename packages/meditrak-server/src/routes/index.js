/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { authenticate } from './authenticate';
import { countChanges } from './countChanges';
import { exportSurveyResponses } from './exportSurveyResponses';
import { exportSurveys } from './exportSurveys';
import { getChanges } from './getChanges';
import { BESAdminCreateHandler } from './CreateHandler';
import { BESAdminDeleteHandler } from './DeleteHandler';
import { BESAdminEditHandler } from './EditHandler';
import { BESAdminGETHandler } from './GETHandler';
import { GETCountries } from './GETCountries';
import { GETClinics } from './GETClinics';
import { GETDisasters } from './GETDisasters';
import { GETDataSources } from './GETDataSources';
import { GETEntities } from './GETEntities';
import { GETFeedItems } from './GETFeedItems';
import { GETGeographicalAreas } from './GETGeographicalAreas';
import { GETSurveyGroups } from './GETSurveyGroups';
import { DeleteQuestions, EditQuestions, GETQuestions } from './questions';
import { GETPermissionGroups } from './GETPermissionGroups';
import { DeleteOptions, EditOptions, GETOptions } from './options';
import { DeleteOptionSets, EditOptionSets, GETOptionSets, importOptionSets } from './optionSets';
import { DeleteAnswers, EditAnswers, GETAnswers } from './answers';
import { DeleteSurveys, EditSurveys, GETSurveys } from './surveys';
import { GETProjects } from './GETProjects';
import {
  DeleteDashboardReports,
  EditDashboardReports,
  GETDashboardReports,
} from './dashboardReports';
import { DeleteDashboardGroups, EditDashboardGroups, GETDashboardGroups } from './dashboardGroups';
import { DeleteDashboardItem, EditDashboardItem, GETDashboardItems } from './dashboardItems';
import { DeleteDashboard, EditDashboard, GETDashboards } from './dashboards';
import {
  DeleteDashboardRelation,
  EditDashboardRelation,
  CreateDashboardRelation,
  GETDashboardRelations,
} from './dashboardRelations';
import { DeleteLegacyReport, EditLegacyReport, GETLegacyReports } from './legacyReports';
import { DeleteMapOverlays, EditMapOverlays, GETMapOverlays } from './mapOverlays';
import { DeleteSurveyResponses, EditSurveyResponses, GETSurveyResponses } from './surveyResponses';
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
} from './userAccounts';
import {
  CreateUserEntityPermissions,
  DeleteUserEntityPermissions,
  EditUserEntityPermissions,
  GETUserEntityPermissions,
} from './userEntityPermissions';
import { EditAccessRequests, GETAccessRequests } from './accessRequests';
import { importEntities } from './importEntities';
import { importStriveLabResults } from './importStriveLabResults';
import { importSurveys } from './importSurveys';
import { importUsers } from './importUsers';
import { postChanges } from './postChanges';
import { importSurveyResponses } from './importSurveyResponses';
import { changePassword } from './changePassword';
import { editUser } from './editUser';
import { requestCountryAccess } from './requestCountryAccess';
import { getSocialFeed } from './getSocialFeed';
import { getUserRewards } from './getUserRewards';
import { requestPasswordReset } from './requestPasswordReset';
import { getCountryAccessList } from './getCountryAccessList';
import { surveyResponse } from './surveyResponse';
import { importDisaster } from './importDisaster';
import { verifyEmail, requestResendEmail } from './verifyEmail';
import { allowNoPermissions } from '../permissions';

/**
 * All routes will be wrapped with an error catcher that simply passes the error to the next()
 * function, causing error handling middleware to be fired. Otherwise, async errors will be
 * swallowed.
 */
const catchAsyncErrors = routeHandler => (res, req, next) => {
  const returnValue = routeHandler(res, req, next);
  if (returnValue && returnValue.catch) {
    // Return value is a Promise, add an error handler
    returnValue.catch(error => next(error));
  }
};

const useRouteHandler = HandlerClass =>
  catchAsyncErrors(async (res, req) => {
    const handler = new HandlerClass(res, req);
    await handler.handle();
  });

/**
 * Quick and dirty permission wrappers, run a basic check before an endpoint
 */
const allowAnyone = routeHandler => (req, res, next) => {
  req.assertPermissions(allowNoPermissions);
  catchAsyncErrors(routeHandler)(req, res, next);
};

export default {
  authenticate: catchAsyncErrors(authenticate),
  countChanges: catchAsyncErrors(countChanges),
  createCountries: useRouteHandler(BESAdminCreateHandler),
  createDataSources: useRouteHandler(BESAdminCreateHandler),
  createDisasters: useRouteHandler(BESAdminCreateHandler),
  createFeedItems: useRouteHandler(BESAdminCreateHandler),
  createIndicators: useRouteHandler(BESAdminCreateHandler),
  createPermissionGroups: useRouteHandler(BESAdminCreateHandler),
  createUserEntityPermissions: useRouteHandler(CreateUserEntityPermissions),
  createDashboardRelations: useRouteHandler(CreateDashboardRelation),
  deleteAnswers: useRouteHandler(DeleteAnswers),
  deleteDashboardGroups: useRouteHandler(DeleteDashboardGroups),
  deleteDashboardReports: useRouteHandler(DeleteDashboardReports),
  deleteDashboards: useRouteHandler(DeleteDashboard),
  deleteDashboardItems: useRouteHandler(DeleteDashboardItem),
  deleteDashboardRelations: useRouteHandler(DeleteDashboardRelation),
  deleteLegacyReports: useRouteHandler(DeleteLegacyReport),
  deleteDataSources: useRouteHandler(BESAdminDeleteHandler),
  deleteDisasters: useRouteHandler(BESAdminDeleteHandler),
  deleteFeedItems: useRouteHandler(BESAdminDeleteHandler),
  deleteIndicators: useRouteHandler(BESAdminDeleteHandler),
  deleteOptions: useRouteHandler(DeleteOptions),
  deleteOptionSets: useRouteHandler(DeleteOptionSets),
  deleteQuestions: useRouteHandler(DeleteQuestions),
  deleteSurveys: useRouteHandler(DeleteSurveys),
  deleteMapOverlays: useRouteHandler(DeleteMapOverlays),
  deleteSurveyResponses: useRouteHandler(DeleteSurveyResponses),
  deleteSurveyScreenComponents: useRouteHandler(DeleteSurveyScreenComponents),
  deleteUserEntityPermissions: useRouteHandler(DeleteUserEntityPermissions),
  createUserAccount: useRouteHandler(CreateUserAccounts),
  registerUserAccount: useRouteHandler(RegisterUserAccounts),
  editAccessRequests: useRouteHandler(EditAccessRequests),
  editAnswers: useRouteHandler(EditAnswers),
  editDashboardGroups: useRouteHandler(EditDashboardGroups),
  editDashboardReports: useRouteHandler(EditDashboardReports),
  editDashboards: useRouteHandler(EditDashboard),
  editDashboardItems: useRouteHandler(EditDashboardItem),
  editDashboardRelations: useRouteHandler(EditDashboardRelation),
  editLegacyReports: useRouteHandler(EditLegacyReport),
  editDataSources: useRouteHandler(BESAdminEditHandler),
  editDisasters: useRouteHandler(BESAdminEditHandler),
  editFeedItems: useRouteHandler(BESAdminEditHandler),
  editIndicators: useRouteHandler(BESAdminEditHandler),
  editOptions: useRouteHandler(EditOptions),
  editOptionSets: useRouteHandler(EditOptionSets),
  editQuestions: useRouteHandler(EditQuestions),
  editSurveys: useRouteHandler(EditSurveys),
  editMapOverlays: useRouteHandler(EditMapOverlays),
  editProjects: useRouteHandler(BESAdminEditHandler),
  editSurveyResponses: useRouteHandler(EditSurveyResponses),
  editSurveyScreenComponents: useRouteHandler(EditSurveyScreenComponents),
  editUserAccounts: useRouteHandler(EditUserAccounts),
  editUserEntityPermissions: useRouteHandler(EditUserEntityPermissions),
  exportSurveyResponses: catchAsyncErrors(exportSurveyResponses),
  exportSurveys: catchAsyncErrors(exportSurveys),
  getChanges: catchAsyncErrors(getChanges),
  getAnswers: useRouteHandler(GETAnswers),
  getCountries: useRouteHandler(GETCountries),
  getClinics: useRouteHandler(GETClinics),
  getDisasters: useRouteHandler(GETDisasters),
  getDashboardReports: useRouteHandler(GETDashboardReports),
  getDashboardGroups: useRouteHandler(GETDashboardGroups),
  getDashboards: useRouteHandler(GETDashboards),
  getDashboardItems: useRouteHandler(GETDashboardItems),
  getDashboardRelations: useRouteHandler(GETDashboardRelations),
  getLegacyReports: useRouteHandler(GETLegacyReports),
  getIndicators: useRouteHandler(BESAdminGETHandler),
  getDataSources: useRouteHandler(GETDataSources),
  getEntities: useRouteHandler(GETEntities),
  getGeographicalAreas: useRouteHandler(GETGeographicalAreas),
  getFeedItems: useRouteHandler(GETFeedItems),
  getMapOverlays: useRouteHandler(GETMapOverlays),
  getSurveys: useRouteHandler(GETSurveys),
  getSurveyGroups: useRouteHandler(GETSurveyGroups),
  getSurveyResponses: useRouteHandler(GETSurveyResponses),
  getSurveyScreenComponents: useRouteHandler(GETSurveyScreenComponents),
  getQuestions: useRouteHandler(GETQuestions),
  getPermissionGroups: useRouteHandler(GETPermissionGroups),
  getOptions: useRouteHandler(GETOptions),
  getOptionSets: useRouteHandler(GETOptionSets),
  getProjects: useRouteHandler(GETProjects),
  getUserAccounts: useRouteHandler(GETUserAccounts),
  getUserEntityPermissions: useRouteHandler(GETUserEntityPermissions),
  getAccessRequests: useRouteHandler(GETAccessRequests),
  importEntities: catchAsyncErrors(importEntities),
  importStriveLabResults: catchAsyncErrors(importStriveLabResults),
  importSurveys: catchAsyncErrors(importSurveys),
  importUsers: catchAsyncErrors(importUsers),
  importOptionSets: catchAsyncErrors(importOptionSets),
  postChanges: catchAsyncErrors(postChanges),
  importSurveyResponses: catchAsyncErrors(importSurveyResponses),
  changePassword: catchAsyncErrors(changePassword),
  editUser: catchAsyncErrors(editUser),
  requestCountryAccess: allowAnyone(requestCountryAccess),
  getSocialFeed: catchAsyncErrors(getSocialFeed),
  getUserRewards: allowAnyone(getUserRewards),
  getUser: useRouteHandler(GETUserForMe),
  requestPasswordReset: catchAsyncErrors(requestPasswordReset),
  getCountryAccessList: allowAnyone(getCountryAccessList),
  surveyResponse: catchAsyncErrors(surveyResponse),
  importDisaster: catchAsyncErrors(importDisaster),
  verifyEmail: catchAsyncErrors(verifyEmail),
  requestResendEmail: catchAsyncErrors(requestResendEmail),
};
