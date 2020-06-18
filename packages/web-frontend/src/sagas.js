/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { call, put, delay, takeEvery, takeLatest, select } from 'redux-saga/effects';
import queryString from 'query-string';
import request from './utils/request';
import {
  selectOrgUnit,
  selectOrgUnitChildren,
  selectOrgUnitCountry,
  selectIsProject,
  selectActiveProject,
  selectProjectByCode,
  selectMeasureBarItemById,
} from './selectors';
import {
  ATTEMPT_CHANGE_PASSWORD,
  ATTEMPT_LOGIN,
  ATTEMPT_LOGOUT,
  ATTEMPT_RESET_PASSWORD,
  ATTEMPT_REQUEST_COUNTRY_ACCESS,
  ATTEMPT_SIGNUP,
  ATTEMPT_CHART_EXPORT,
  ATTEMPT_DRILL_DOWN,
  CHANGE_ORG_UNIT,
  FETCH_INFO_VIEW_DATA,
  CHANGE_SEARCH,
  CHANGE_MEASURE,
  FIND_USER_LOGGEDIN,
  FETCH_LOGOUT_SUCCESS,
  FETCH_LOGIN_SUCCESS,
  GO_HOME,
  SET_PASSWORD_RESET_TOKEN,
  OPEN_USER_DIALOG,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  FINISH_USER_SESSION,
  SET_VERIFY_EMAIL_TOKEN,
  changeMeasure,
  clearMeasure,
  clearMeasureHierarchy,
  findLoggedIn,
  fetchChangePasswordSuccess,
  fetchChangePasswordError,
  fetchResetPasswordSuccess,
  fetchResetPasswordError,
  fetchCountryAccessDataSuccess,
  fetchCountryAccessDataError,
  fetchUserLoginSuccess,
  fetchUserLoginError,
  fetchUserLogoutSuccess,
  fetchUserLogoutError,
  fetchUserSignupSuccess,
  displayUnverified,
  fetchUserSignupError,
  fetchOrgUnitSuccess,
  changeOrgUnitSuccess,
  changeOrgUnitError,
  fetchDashboardSuccess,
  fetchDashboardError,
  fetchDashboardItemDataSuccess,
  fetchDashboardItemDataError,
  fetchSearchSuccess,
  fetchSearchError,
  fetchMeasureInfoSuccess,
  fetchMeasureInfoError,
  cancelFetchMeasureData,
  fetchMeasuresSuccess,
  fetchMeasuresError,
  fetchRequestCountryAccessError,
  fetchRequestCountryAccessSuccess,
  fetchChartExportSuccess,
  fetchChartExportError,
  fetchDrillDownSuccess,
  fetchDrillDownError,
  changeOrgUnit,
  SET_ENLARGED_DIALOG_DATE_RANGE,
  updateEnlargedDialog,
  updateEnlargedDialogError,
  FETCH_MEASURES_SUCCESS,
  CHANGE_ORG_UNIT_SUCCESS,
  openEmailVerifiedPage,
  fetchEmailVerifyError,
  openResendEmailSuccess,
  fetchResendEmailError,
  setOverlayComponent,
  FETCH_RESEND_VERIFICATION_EMAIL,
  findUserLoginFailed,
  REQUEST_PROJECT_ACCESS,
  fetchOrgUnitError,
  fetchOrgUnit,
  REQUEST_ORG_UNIT,
} from './actions';
import { isMobile, processMeasureInfo, formatDateForApi } from './utils';
import { createUrlString } from './utils/historyNavigation';
import { getDefaultDates } from './utils/periodGranularities';
import { INITIAL_MEASURE_ID, INITIAL_PROJECT_CODE, initialOrgUnit } from './defaults';
import { selectProject } from './projects/actions';

/**
 * attemptChangePassword
 *
 * Attempt to change a user's password and call action on success/fail.
 *
 */
function* attemptChangePassword(action) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oldPassword: action.oldPassword,
      password: action.password,
      passwordConfirm: action.passwordConfirm,
      oneTimeLoginToken: action.passwordResetToken,
    }),
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'changePassword';
  try {
    yield call(request, requestResourceUrl, fetchChangePasswordError, options);
    yield put(fetchChangePasswordSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

function* watchAttemptChangePasswordAndFetchIt() {
  yield takeLatest(ATTEMPT_CHANGE_PASSWORD, attemptChangePassword);
}

/**
 * attemptResetPassword
 *
 * Attempt to send a reset password email and call action on success/fail.
 *
 */
function* attemptResetPassword(action) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailAddress: action.email }),
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'resetPassword';
  try {
    yield call(request, requestResourceUrl, fetchResetPasswordError, options);
    yield put(fetchResetPasswordSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

function* watchAttemptResetPasswordAndFetchIt() {
  yield takeLatest(ATTEMPT_RESET_PASSWORD, attemptResetPassword);
}

function* resendVerificationEmail(action) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailAddress: action.email }),
  };

  const requestResourceUrl = 'resendEmail';
  try {
    yield call(request, requestResourceUrl, fetchResendEmailError, options);
    yield put(openResendEmailSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(fetchResendEmailError(errorMessage.details ? errorMessage.details : ''));
  }
}

function* watchResendEmailVerificationAndFetchIt() {
  yield takeLatest(FETCH_RESEND_VERIFICATION_EMAIL, resendVerificationEmail);
}
/**
 * attemptUserLogin
 *
 * Attempt to do a user login and call action on success/fail.
 *
 */
function* attemptUserLogin(action) {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emailAddress: action.emailAddress,
      password: action.password,
    }),
  };

  const requestContext = {
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'login';
  try {
    const response = yield call(
      request,
      requestResourceUrl,
      fetchUserLoginError,
      fetchOptions,
      requestContext,
      false,
    );
    yield put(findLoggedIn(true, response.emailVerified));
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    if (errorMessage.details && errorMessage.details === 'Email address not yet verified') {
      yield put(displayUnverified());
    } else yield put(error.errorFunction(errorMessage));
  }
}

function* watchAttemptUserLoginAndFetchIt() {
  yield takeLatest(ATTEMPT_LOGIN, attemptUserLogin);
}

/**
 * attemptUserSignup
 *
 * Attempt to do a user signup and call action on success/fail.
 *
 */
function* attemptUserSignup(action) {
  const { fields } = action;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  };

  const requestContext = {
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'signup';
  try {
    yield call(
      request,
      requestResourceUrl,
      fetchUserSignupError,
      fetchOptions,
      requestContext,
      false,
    );
    yield put(fetchUserSignupSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

function* watchAttemptUserSignupAndFetchIt() {
  yield takeLatest(ATTEMPT_SIGNUP, attemptUserSignup);
}

/**
 * attemptUserLogout
 *
 * Attempt to do a user logout.
 *
 */
function* attemptUserLogout() {
  const requestResourceUrl = 'logout';
  try {
    yield call(request, requestResourceUrl, fetchUserLogoutError);
    yield put(fetchUserLogoutSuccess());
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

function* watchAttemptUserLogout() {
  yield takeLatest(ATTEMPT_LOGOUT, attemptUserLogout);
}

function* attemptVerifyToken(action) {
  const { verifyEmailToken } = action;
  const requestResourceUrl = `verifyEmail?emailToken=${verifyEmailToken}`;
  try {
    yield call(request, requestResourceUrl);
    yield put(openEmailVerifiedPage());
    yield put(setOverlayComponent('landing'));
  } catch (error) {
    yield put(fetchEmailVerifyError());
    yield put(setOverlayComponent('landing'));
  }
}

function* watchSetVerifyEmailToken() {
  yield takeLatest(SET_VERIFY_EMAIL_TOKEN, attemptVerifyToken);
}

function* attemptTokenLogin(action) {
  const { passwordResetToken } = action;
  const body = {
    token: passwordResetToken,
  };

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  const requestContext = {
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'login/oneTimeLogin';
  try {
    yield call(
      request,
      requestResourceUrl,
      fetchUserLoginError,
      fetchOptions,
      requestContext,
      false,
    );
    yield put(findLoggedIn(false, true)); //default to email verified for one time login to prevent a nag screen
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

function* watchSetPasswordResetToken() {
  yield takeLatest(SET_PASSWORD_RESET_TOKEN, attemptTokenLogin);
}

/**
 * attemptRequestCountryAccess
 *
 * Attempt to request country access for the logged in user and call action on success/fail.
 *
 */
function* attemptRequestCountryAccess(action) {
  const { message, userGroup } = action;
  const entityIds = action.entityIds ? Object.keys(action.entityIds) : [];

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entityIds,
      message,
      userGroup,
    }),
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'requestCountryAccess';
  try {
    yield call(request, requestResourceUrl, fetchRequestCountryAccessError, options);
    yield put(fetchRequestCountryAccessSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

function* watchAttemptRequestCountryAccessAndFetchIt() {
  yield takeLatest(ATTEMPT_REQUEST_COUNTRY_ACCESS, attemptRequestCountryAccess);
}

/**
 * fetchCountryAccessData
 *
 * Fetches a list of all countries and the user's access to them
 *
 */
function* fetchCountryAccessDataIfRequired(action) {
  // If the dialog page being opened was not the request country access page, don't bother fetching
  if (
    action.dialogPage !== DIALOG_PAGE_REQUEST_COUNTRY_ACCESS &&
    action.type !== REQUEST_PROJECT_ACCESS
  ) {
    return;
  }
  const requestResourceUrl = 'countryAccessList';
  try {
    const countries = yield call(request, requestResourceUrl, fetchCountryAccessDataError);
    yield put(fetchCountryAccessDataSuccess(countries));
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

function* watchFetchCountryAccessDataAndFetchIt() {
  yield takeLatest(OPEN_USER_DIALOG, fetchCountryAccessDataIfRequired);
}

function* watchFetchCountryAccessDataAndFetchItTEST() {
  yield takeLatest(REQUEST_PROJECT_ACCESS, fetchCountryAccessDataIfRequired);
}

/**
 * fetchOrgUnitData
 *
 * Fetch an org unit.
 *
 */
function* fetchOrgUnitData(
  organisationUnitCode = initialOrgUnit.organisationUnitCode,
  projectCode = INITIAL_PROJECT_CODE,
) {
  try {
    yield put(fetchOrgUnit(organisationUnitCode));
    // Build the request url
    const urlParameters = {
      organisationUnitCode,
      projectCode,
      includeCountryData: organisationUnitCode !== projectCode, // We should pull in all country data if we are within a project
    };
    const requestResourceUrl = `organisationUnit?${queryString.stringify(urlParameters)}`;
    const orgUnitData = yield call(request, requestResourceUrl);
    yield put(fetchOrgUnitSuccess(orgUnitData));
    return orgUnitData;
  } catch (error) {
    yield put(fetchOrgUnitError(organisationUnitCode, error.message));
    throw error;
  }
}

function* requestOrgUnit(action) {
  const state = yield select();
  const { organisationUnitCode = selectActiveProject(state).code } = action;
  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  if (orgUnit && orgUnit.isComplete) {
    return; // If we already have the complete org unit in reduxStore, just exit early
  }

  yield fetchOrgUnitData(organisationUnitCode, selectActiveProject(state).code);
}

function* fetchOrgUnitDataAndChangeOrgUnit(action) {
  const state = yield select();
  const { organisationUnitCode, shouldChangeMapBounds } = action;
  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  if (orgUnit && orgUnit.isComplete) {
    const orgUnitAndChildren = {
      ...orgUnit,
      parent: selectOrgUnit(state, orgUnit.parent) || {},
      organisationUnitChildren: selectOrgUnitChildren(state, organisationUnitCode),
    };
    yield put(changeOrgUnitSuccess(orgUnitAndChildren, shouldChangeMapBounds));
    return; // If we already have the org unit in reduxStore, just exit early
  }

  try {
    const orgUnitData = yield fetchOrgUnitData(
      organisationUnitCode,
      selectActiveProject(state).code,
    );
    yield put(
      changeOrgUnitSuccess(
        normaliseCountryHierarchyOrgUnitData(orgUnitData),
        shouldChangeMapBounds,
      ),
    );
  } catch (error) {
    console.log(error);
    yield put(changeOrgUnitError(error));
  }
}

const normaliseCountryHierarchyOrgUnitData = orgUnitData => {
  const { countryHierarchy, ...restOfOrgUnit } = orgUnitData;
  if (!countryHierarchy) {
    return orgUnitData;
  }

  const hierarchyOrgUnitItem = countryHierarchy.find(
    hierarchyItem => hierarchyItem.organisationUnitCode === orgUnitData.organisationUnitCode,
  );

  const parent = countryHierarchy.find(
    hierarchyItem => hierarchyItem.organisationUnitCode === hierarchyOrgUnitItem.parent,
  );

  return {
    ...restOfOrgUnit,
    parent,
    organisationUnitChildren: countryHierarchy.filter(
      descendant => descendant.parent === orgUnitData.organisationUnitCode,
    ),
  };
};

function* watchRequestOrgUnitAndFetchIt() {
  yield takeEvery(REQUEST_ORG_UNIT, requestOrgUnit);
}

function* watchOrgUnitChangeAndFetchIt() {
  yield takeLatest(CHANGE_ORG_UNIT, fetchOrgUnitDataAndChangeOrgUnit);
}

/**
 * fetchDashboard
 *
 * Fetches a dashboard for the orgUnit given in action
 *
 */
function* fetchDashboard(action) {
  const { organisationUnitCode } = action.organisationUnit;
  const projectCode = (yield select(selectActiveProject)).code;
  const requestResourceUrl = `dashboard?organisationUnitCode=${organisationUnitCode}&projectCode=${projectCode}`;

  try {
    const dashboard = yield call(request, requestResourceUrl, fetchDashboardError);
    yield put(fetchDashboardSuccess(dashboard));
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

function* watchOrgUnitChangeAndFetchDashboard() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchDashboard);
}

function* fetchViewData(parameters, errorHandler) {
  const { infoViewKey } = parameters;
  const projectCode = (yield select(selectActiveProject)).code;

  // If the view should be constrained to a date range and isn't, constrain it
  const state = yield select();
  const { startDate, endDate } =
    parameters.startDate || parameters.endDate
      ? parameters
      : getDefaultDates(state.global.viewConfigs[infoViewKey]);
  // Build the request url
  const {
    organisationUnitCode,
    dashboardGroupId,
    viewId,
    drillDownLevel,
    isExpanded,
    extraUrlParameters,
  } = parameters;
  const urlParameters = {
    organisationUnitCode,
    projectCode,
    dashboardGroupId,
    viewId,
    drillDownLevel,
    isExpanded,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    ...extraUrlParameters,
  };
  const requestResourceUrl = `view?${queryString.stringify(urlParameters)}`;

  try {
    const viewData = yield call(request, requestResourceUrl, errorHandler);
    return viewData;
  } catch (error) {
    if (error.errorFunction) {
      yield put(error.errorFunction(error, infoViewKey));
    } else {
      console.log(`Failed to handle error: ${error.message}`);
    }
  }
  return null;
}

/**
 * fetchDashboardItemData
 *
 * Fetches a dashboard for the orgUnit given in action
 *
 */
function* fetchDashboardItemData(action) {
  const { dashboardItemProject, infoViewKey } = action;

  // If this dashboard item is a member of a module that requires extra work before fetching its
  // data, allow the module to handle that work and return any extra url parameters
  let prepareForDashboardItemDataFetch;
  try {
    // eslint-disable-next-line import/no-dynamic-require
    const moduleSagas = require(`./${dashboardItemProject}/sagas`);
    prepareForDashboardItemDataFetch = moduleSagas.prepareForDashboardItemDataFetch;
  } catch (error) {
    // the project is not associated with a module handling its own sagas, ignore
  }

  // Run preparation saga if it exists to collect module specific url parameters
  let extraUrlParameters = {};
  if (prepareForDashboardItemDataFetch) {
    extraUrlParameters = yield call(prepareForDashboardItemDataFetch);
  }

  const viewData = yield call(
    fetchViewData,
    { ...action, extraUrlParameters },
    fetchDashboardItemDataError,
  );
  if (viewData) {
    yield put(fetchDashboardItemDataSuccess(viewData, infoViewKey));
  }
}

function* watchViewFetchRequests() {
  // Watches for VIEW_FETCH_REQUESTED actions and calls fetchDashboardItemData when one comes in.
  // By using `takeEvery` fetches for different views will be run simultaneously.
  // It returns task descriptor (just like fork) so we can continue execution
  yield takeEvery(FETCH_INFO_VIEW_DATA, fetchDashboardItemData);
}

/**
 * fetchSearchData
 *
 * Fetches search results for the search bar
 *
 */
function* fetchSearchData(action) {
  yield delay(200); // Wait 200 ms in case user keeps typing
  if (action.searchString === '') {
    yield put(fetchSearchSuccess([]));
  } else {
    const urlParameters = {
      criteria: action.searchString,
      limit: 5,
      projectCode: (yield select(selectActiveProject)).code,
    };
    const requestResourceUrl = `organisationUnitSearch?${queryString.stringify(urlParameters)}`;
    try {
      const response = yield call(request, requestResourceUrl);
      yield put(fetchSearchSuccess(response));
    } catch (error) {
      yield put(fetchSearchError(error));
    }
  }
}

function* watchSearchChange() {
  yield takeLatest(CHANGE_SEARCH, fetchSearchData);
}

/**
 * fetchmeasureInfo
 *
 * Fetches data for a measure and write it to map state by calling fetchMeasureSuccess.
 *
 */
function* fetchMeasureInfo(measureId, organisationUnitCode) {
  const state = yield select();
  if (selectIsProject(state, organisationUnitCode)) {
    // Never want to fetch measures for World org code.
    yield put(cancelFetchMeasureData());
    yield put(clearMeasureHierarchy());
    return;
  }

  if (!measureId || !organisationUnitCode) {
    // Don't try and fetch null measures
    yield put(cancelFetchMeasureData());

    return;
  }

  const project = selectActiveProject(state);
  const country = selectOrgUnitCountry(state, organisationUnitCode);
  const countryCode = country ? country.organisationUnitCode : undefined;
  const measureParams = selectMeasureBarItemById(state, measureId) || {};

  // If the view should be constrained to a date range and isn't, constrain it
  const { startDate, endDate } =
    measureParams.startDate || measureParams.endDate
      ? measureParams
      : getDefaultDates(measureParams);

  const urlParameters = {
    measureId,
    organisationUnitCode,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    shouldShowAllParentCountryResults: !isMobile(),
    projectCode: project.code,
  };
  const requestResourceUrl = `measureData?${queryString.stringify(urlParameters)}`;

  try {
    const measureInfoResponse = yield call(request, requestResourceUrl);
    const measureInfo = processMeasureInfo(measureInfoResponse);

    yield put(fetchMeasureInfoSuccess(measureInfo, countryCode));
  } catch (error) {
    console.log(error);
    yield put(fetchMeasureInfoError(error));
  }
}

function* fetchMeasureInfoForMeasureChange(action) {
  const { measureId, organisationUnitCode } = action;
  yield fetchMeasureInfo(measureId, organisationUnitCode);
}

function* watchMeasureChange() {
  yield takeLatest(CHANGE_MEASURE, fetchMeasureInfoForMeasureChange);
}

function getSelectedMeasureFromHierarchy(measureHierarchy, selectedMeasureId, project) {
  const projectMeasureId = project.defaultMeasure;
  const measures = Object.values(measureHierarchy).flat();

  if (measures.find(m => m.measureId === selectedMeasureId)) return selectedMeasureId;
  else if (measures.find(m => m.measureId === projectMeasureId)) return projectMeasureId;
  else if (measures.find(m => m.measureId === INITIAL_MEASURE_ID)) return INITIAL_MEASURE_ID;
  else if (measures.length) return measures[0].measureId;
  return INITIAL_MEASURE_ID;
}

function* fetchCurrentMeasureInfo() {
  const state = yield select();
  const { currentOrganisationUnitCode } = state.global;
  const { active: activeProject } = state.project;
  const { measureId } = state.map.measureInfo;
  const { measureHierarchy, selectedMeasureId } = state.measureBar;

  if (currentOrganisationUnitCode && !selectIsProject(state, currentOrganisationUnitCode)) {
    const isHeirarchyPopulated = Object.keys(measureHierarchy).length;

    // Update the default measure ID
    if (isHeirarchyPopulated) {
      const newMeasure = getSelectedMeasureFromHierarchy(
        measureHierarchy,
        selectedMeasureId,
        activeProject,
      );

      if (newMeasure !== measureId) {
        yield put(changeMeasure(newMeasure, currentOrganisationUnitCode));
      }
    } else {
      /** Ensure measure is selected if there is a current measure selected in the case
       * it is not selected through the measureBar UI
       * i.e. page reloaded when on org with measure selected
       */
      yield put(changeMeasure(measureId, currentOrganisationUnitCode));
    }
  }
}

// Ensures current measure remains selected on new org unit fetch
function* watchChangeOrgUnitSuccess() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchCurrentMeasureInfo);
}

// Ensures current measure remains selected in the case that the new org unit
// was selected before measures finished fetching
function* watchFetchMeasureSuccess() {
  yield takeLatest(FETCH_MEASURES_SUCCESS, fetchCurrentMeasureInfo);
}

function* fetchMeasureInfoForNewOrgUnit(action) {
  const { organisationUnitCode, countryCode } = action.organisationUnit;
  const { measureId, oldOrgUnitCountry } = yield select(state => ({
    measureId: state.map.measureInfo.measureId,
    oldOrgUnitCountry: state.map.measureInfo.currentCountry,
  }));
  if (oldOrgUnitCountry === countryCode) {
    // We are in the same country as before, no need to refetch measureData
    return;
  }

  if (measureId) {
    yield put(changeMeasure(measureId, organisationUnitCode));
  }
}

function* watchOrgUnitChangeAndFetchMeasureInfo() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchMeasureInfoForNewOrgUnit);
}

/**
 * fetchMeasures
 *
 * Fetches the measures for current orgUnit for the current user. Written to measureBar State.
 *
 */
function* fetchMeasures(action) {
  const { organisationUnitCode } = action.organisationUnit;
  const state = yield select();
  if (selectIsProject(state, organisationUnitCode)) yield put(clearMeasure());
  const projectCode = (yield select(selectActiveProject)).code;
  const requestResourceUrl = `measures?organisationUnitCode=${organisationUnitCode}&projectCode=${projectCode}`;
  try {
    const measures = yield call(request, requestResourceUrl);
    yield put(fetchMeasuresSuccess(measures));
  } catch (error) {
    yield put(fetchMeasuresError(error));
  }
}

function* watchOrgUnitChangeAndFetchMeasures() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchMeasures);
}

/**
 * findUserLoggedIn
 *
 * Find if any user was logged in and call action on success/fail.
 *
 */
function* findUserLoggedIn(action) {
  const requestResourceUrl = 'getUser';

  try {
    const userData = yield call(request, requestResourceUrl);
    if (userData.name !== 'public') {
      yield put(fetchUserLoginSuccess(userData.name, userData.email, action.shouldCloseDialog));
    } else {
      yield put(findUserLoginFailed());
    }
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

function* watchFindUserCurrentLoggedIn() {
  yield takeLatest(FIND_USER_LOGGEDIN, findUserLoggedIn);
}

function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    // Time zone not supported in this browser.
    return 'Australia/Melbourne';
  }
}

function* exportChart(action) {
  const requestResourceUrl = 'export/chart';

  const {
    viewId,
    dashboardGroupId,
    organisationUnitCode,
    organisationUnitName,
    selectedFormat,
    exportFileName,
    chartType,
    startDate,
    endDate,
    selectedDisaster,
    extraConfig,
  } = action;

  const timeZone = getTimeZone();

  const exportUrl = createUrlString({
    dashboardId: dashboardGroupId,
    reportId: viewId,
    organisationUnitCode,
    timeZone,
    startDate: formatDateForApi(startDate, timeZone),
    endDate: formatDateForApi(endDate, timeZone),
    disasterStartDate: selectedDisaster && formatDateForApi(selectedDisaster.startDate, timeZone),
    disasterEndDate: selectedDisaster && formatDateForApi(selectedDisaster.endDate, timeZone),
  });

  const fetchOptions = Object.assign(
    {},
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exportUrl,
        viewId,
        dashboardGroupId,
        organisationUnitCode,
        organisationUnitName,
        selectedFormat,
        exportFileName,
        chartType,
        extraConfig,
      }),
    },
  );

  const requestContext = {
    alwaysUseSuppliedErrorFunction: true,
  };

  try {
    yield call(request, requestResourceUrl, fetchChartExportError, fetchOptions, requestContext);
    yield put(fetchChartExportSuccess());
  } catch (error) {
    yield put(error.errorFunction(error.message));
  }
}

function* watchAttemptChartExport() {
  yield takeLatest(ATTEMPT_CHART_EXPORT, exportChart);
}

/**
 * Fetches drilldown data for a given view and level.
 */
function* fetchDrillDownData(action) {
  const { parameterLink, parameterValue, drillDownLevel, ...restOfAction } = action;
  const drillDownData = yield call(
    fetchViewData,
    {
      isExpanded: true,
      extraUrlParameters: { [parameterLink]: parameterValue },
      drillDownLevel,
      ...restOfAction,
    },
    fetchDrillDownError,
  );
  if (drillDownData) {
    yield put(fetchDrillDownSuccess(drillDownLevel, drillDownData));
  }
}

function* watchAttemptAttemptDrillDown() {
  yield takeLatest(ATTEMPT_DRILL_DOWN, fetchDrillDownData);
}

function* resetToExplore() {
  // default measure will be selected once the org unit has fully changed, just clear for now
  yield put(clearMeasure());
  yield put(clearMeasureHierarchy());
  yield put(
    selectProject((yield select(selectProjectByCode, 'explore')) || { code: INITIAL_PROJECT_CODE }),
  );
  yield put(changeOrgUnit('explore', true));
}

function* watchUserChangesAndUpdatePermissions() {
  // On user login/logout, we should just navigate back to explore project, as we don't know if they have permissions
  // to the current project or organisation unit
  yield takeLatest(FETCH_LOGOUT_SUCCESS, resetToExplore);
  yield takeLatest(FETCH_LOGIN_SUCCESS, resetToExplore);
}

function* watchGoHomeAndResetToExplore() {
  yield takeLatest(GO_HOME, resetToExplore);
}

function* fetchEnlargedDialogViewContentForPeriod(action) {
  const state = yield select();
  const { viewContent, infoViewKey } = state.enlargedDialog;
  const { viewId, organisationUnitCode, dashboardGroupId } = viewContent;

  const parameters = {
    ...action,
    viewId,
    organisationUnitCode,
    dashboardGroupId,
    isExpanded: true,
    infoViewKey,
  };

  const viewData = yield call(fetchViewData, parameters, updateEnlargedDialogError);
  if (viewData) {
    yield put(updateEnlargedDialog(viewData));
  }
}

function* watchSetEnlargedDialogSelectedPeriodFilterAndRefreshViewContent() {
  yield takeLatest(SET_ENLARGED_DIALOG_DATE_RANGE, fetchEnlargedDialogViewContentForPeriod);
}

function* refreshBrowserWhenFinishingUserSession() {
  yield takeLatest(FINISH_USER_SESSION, () => {
    window.location.reload();
  });
}

// Add all sagas to be loaded
export default [
  watchAttemptChangePasswordAndFetchIt,
  watchAttemptResetPasswordAndFetchIt,
  watchAttemptRequestCountryAccessAndFetchIt,
  watchAttemptUserLoginAndFetchIt,
  watchAttemptUserLogout,
  watchAttemptUserSignupAndFetchIt,
  watchFetchCountryAccessDataAndFetchIt,
  watchRequestOrgUnitAndFetchIt,
  watchOrgUnitChangeAndFetchIt,
  watchOrgUnitChangeAndFetchDashboard,
  watchOrgUnitChangeAndFetchMeasureInfo,
  watchViewFetchRequests,
  watchSearchChange,
  watchMeasureChange,
  watchOrgUnitChangeAndFetchMeasures,
  watchFindUserCurrentLoggedIn,
  watchAttemptChartExport,
  watchAttemptAttemptDrillDown,
  watchUserChangesAndUpdatePermissions,
  watchSetEnlargedDialogSelectedPeriodFilterAndRefreshViewContent,
  watchSetPasswordResetToken,
  watchResendEmailVerificationAndFetchIt,
  watchSetVerifyEmailToken,
  watchFetchMeasureSuccess,
  watchChangeOrgUnitSuccess,
  refreshBrowserWhenFinishingUserSession,
  watchFetchCountryAccessDataAndFetchItTEST,
  watchGoHomeAndResetToExplore,
];
