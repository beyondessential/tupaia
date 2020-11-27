/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { authenticate } from './authenticate';
import { countChanges } from './countChanges';
import { deleteRecord } from './deleteRecord';
import { editRecord } from './editRecord';
import { exportSurveyResponses } from './exportSurveyResponses';
import { exportSurveys } from './exportSurveys';
import { getChanges } from './getChanges';
import { GETDisasters } from './GETDisasters';
import { GETDashboardReports } from './GETDashboardReports';
import { GETDashboardGroups } from './GETDashboardGroups';
import { GETMapOverlays } from './GETMapOverlays';
import { GETSurveys } from './GETSurveys';
import { GETSurveyGroups } from './GETSurveyGroups';
import { GETSurveyScreenComponents } from './GETSurveyScreenComponents';
import { GETQuestions } from './GETQuestions';
import { GETPermissionGroups } from './GETPermissionGroups';
import { GETOptions } from './GETOptions';
import { GETOptionSets } from './GETOptionSets';
import { DeleteAnswers, EditAnswers, GETAnswers } from './answers';
import { DeleteSurveyResponses, EditSurveyResponses, GETSurveyResponses } from './surveyResponses';
import {
  CreateUserAccounts,
  RegisterUserAccounts,
  EditUserAccounts,
  GETUserAccounts,
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
import { importOptionSets } from './importOptionSets';
import { postChanges } from './postChanges';
import { pruneChanges } from './pruneChanges';
import { addRecord } from './addRecord';
import { importSurveyResponses } from './importSurveyResponses';
import { changePassword } from './changePassword';
import { editUser } from './editUser';
import { requestCountryAccess } from './requestCountryAccess';
import { getSocialFeed } from './getSocialFeed';
import { getUserRewards } from './getUserRewards';
import { getUser } from './getUser';
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
  createUserEntityPermissions: useRouteHandler(CreateUserEntityPermissions),
  deleteRecord: catchAsyncErrors(deleteRecord),
  deleteAnswers: useRouteHandler(DeleteAnswers),
  deleteSurveyResponses: useRouteHandler(DeleteSurveyResponses),
  deleteUserEntityPermissions: useRouteHandler(DeleteUserEntityPermissions),
  editRecord: catchAsyncErrors(editRecord),
  createUserAccount: useRouteHandler(CreateUserAccounts),
  registerUserAccount: useRouteHandler(RegisterUserAccounts),
  editAccessRequests: useRouteHandler(EditAccessRequests),
  editAnswers: useRouteHandler(EditAnswers),
  editSurveyResponses: useRouteHandler(EditSurveyResponses),
  editUserAccounts: useRouteHandler(EditUserAccounts),
  editUserEntityPermissions: useRouteHandler(EditUserEntityPermissions),
  exportSurveyResponses: catchAsyncErrors(exportSurveyResponses),
  exportSurveys: catchAsyncErrors(exportSurveys),
  getChanges: catchAsyncErrors(getChanges),
  getAnswers: useRouteHandler(GETAnswers),
  getDisasters: useRouteHandler(GETDisasters),
  getDashboardReports: useRouteHandler(GETDashboardReports),
  getDashboardGroups: useRouteHandler(GETDashboardGroups),
  getMapOverlays: useRouteHandler(GETMapOverlays),
  getSurveys: useRouteHandler(GETSurveys),
  getSurveyGroups: useRouteHandler(GETSurveyGroups),
  getSurveyResponses: useRouteHandler(GETSurveyResponses),
  getSurveyScreenComponents: useRouteHandler(GETSurveyScreenComponents),
  getQuestions: useRouteHandler(GETQuestions),
  getPermissionGroups: useRouteHandler(GETPermissionGroups),
  getOptions: useRouteHandler(GETOptions),
  getOptionSets: useRouteHandler(GETOptionSets),
  getUserAccounts: useRouteHandler(GETUserAccounts),
  getUserEntityPermissions: useRouteHandler(GETUserEntityPermissions),
  getAccessRequests: useRouteHandler(GETAccessRequests),
  importEntities: catchAsyncErrors(importEntities),
  importStriveLabResults: catchAsyncErrors(importStriveLabResults),
  importSurveys: catchAsyncErrors(importSurveys),
  importUsers: catchAsyncErrors(importUsers),
  importOptionSets: catchAsyncErrors(importOptionSets),
  postChanges: catchAsyncErrors(postChanges),
  pruneChanges: catchAsyncErrors(pruneChanges),
  addRecord: catchAsyncErrors(addRecord),
  importSurveyResponses: catchAsyncErrors(importSurveyResponses),
  changePassword: allowAnyone(changePassword),
  editUser: catchAsyncErrors(editUser),
  requestCountryAccess: allowAnyone(requestCountryAccess),
  getSocialFeed: catchAsyncErrors(getSocialFeed),
  getUserRewards: catchAsyncErrors(getUserRewards),
  getUser: catchAsyncErrors(getUser),
  requestPasswordReset: catchAsyncErrors(requestPasswordReset),
  getCountryAccessList: catchAsyncErrors(getCountryAccessList),
  surveyResponse: catchAsyncErrors(surveyResponse),
  importDisaster: catchAsyncErrors(importDisaster),
  verifyEmail: catchAsyncErrors(verifyEmail),
  requestResendEmail: catchAsyncErrors(requestResendEmail),
};
