/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import queryString from 'query-string';
import { call, delay, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import request from './utils/request';
import {
  ATTEMPT_CHANGE_PASSWORD,
  ATTEMPT_LOGIN,
  ATTEMPT_LOGOUT,
  ATTEMPT_REQUEST_COUNTRY_ACCESS,
  ATTEMPT_RESET_PASSWORD,
  ATTEMPT_RESET_TOKEN_LOGIN,
  ATTEMPT_SIGNUP,
  cancelFetchMeasureData,
  changeOrgUnitError,
  changeOrgUnitSuccess,
  CHANGE_ORG_UNIT_SUCCESS,
  CHANGE_SEARCH,
  FETCH_MORE_SEARCH_RESULTS,
  clearMeasure,
  clearMapOverlayHierarchy,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  DIALOG_PAGE_RESET_PASSWORD,
  displayUnverified,
  fetchChangePasswordError,
  fetchChangePasswordSuccess,
  fetchCountryAccessDataError,
  fetchCountryAccessDataSuccess,
  fetchDashboardError,
  fetchDashboardItemDataError,
  fetchDashboardItemDataSuccess,
  fetchDashboardsSuccess,
  fetchEmailVerifyError,
  fetchMeasureInfoError,
  fetchMeasureInfoSuccess,
  fetchMeasuresError,
  fetchMeasuresSuccess,
  fetchOrgUnit,
  fetchOrgUnitError,
  fetchOrgUnitSuccess,
  fetchRequestCountryAccessError,
  fetchRequestCountryAccessSuccess,
  fetchResendEmailError,
  fetchResetPasswordError,
  fetchResetPasswordSuccess,
  fetchResetTokenLoginError,
  fetchResetTokenLoginSuccess,
  fetchSearchError,
  fetchSearchSuccess,
  fetchUserLoginError,
  fetchUserLoginSuccess,
  fetchUserLogoutError,
  fetchUserLogoutSuccess,
  fetchUserSignupError,
  fetchUserSignupSuccess,
  FETCH_INFO_VIEW_DATA,
  FETCH_LOGIN_SUCCESS,
  FETCH_LOGOUT_SUCCESS,
  FETCH_MEASURES_SUCCESS,
  FETCH_RESEND_VERIFICATION_EMAIL,
  FETCH_RESET_TOKEN_LOGIN_SUCCESS,
  findLoggedIn,
  findUserLoginFailed,
  FIND_USER_LOGGEDIN,
  FINISH_USER_SESSION,
  GO_HOME,
  openEmailVerifiedPage,
  openResendEmailSuccess,
  openUserPage,
  OPEN_USER_DIALOG,
  REQUEST_ORG_UNIT,
  REQUEST_PROJECT_ACCESS,
  setMapOverlay,
  setOverlayComponent,
  FETCH_ENLARGED_DIALOG_DATA,
  SET_MAP_OVERLAY,
  SET_ORG_UNIT,
  SET_VERIFY_EMAIL_TOKEN,
  updateEnlargedDialog,
  updateEnlargedDialogError,
  updateMeasureConfig,
  UPDATE_MEASURE_CONFIG,
  UPDATE_MEASURE_DATE_RANGE_ONCE_HIERARCHY_LOADS,
  FETCH_INITIAL_DATA,
  setPasswordResetToken,
  DIALOG_PAGE_ONE_TIME_LOGIN,
  setVerifyEmailToken,
  setOrgUnit,
  openEnlargedDialog,
  updateCurrentMeasureConfigOnceHierarchyLoads,
  LOCATION_CHANGE,
  goHome,
  setDashboardGroup,
} from './actions';
import { LOGIN_TYPES } from './constants';
import {
  LANDING,
  PROJECT_LANDING,
  PROJECTS_WITH_LANDING_PAGES,
} from './containers/OverlayDiv/constants';
import { DEFAULT_PROJECT_CODE } from './defaults';
import { fetchDisasterDateRange } from './disaster/sagas';
import {
  convertUrlPeriodStringToDateRange,
  getInitialLocation,
  URL_COMPONENTS,
} from './historyNavigation';
import { setProject, setRequestingAccess } from './projects/actions';
import {
  selectCurrentInfoViewKey,
  selectCurrentMapOverlayIds,
  selectCurrentOrgUnitCode,
  selectShouldUseDashboardData,
  selectCurrentPeriodGranularity,
  selectCurrentProjectCode,
  selectCurrentExpandedViewConfig,
  selectCurrentExpandedViewContent,
  selectDefaultMapOverlayId,
  selectIsProject,
  selectMapOverlayById,
  selectOrgUnit,
  selectOrgUnitChildren,
  selectOrgUnitCountry,
  selectProjectByCode,
  selectCurrentProject,
  selectCurrentDashboardNameFromLocation,
  selectViewConfig,
} from './selectors';
import {
  formatDateForApi,
  isMobile,
  processMeasureInfo,
  getInfoFromInfoViewKey,
  getBrowserTimeZone,
  checkHierarchyIncludesMapOverlayIds,
} from './utils';
import { getDefaultDates, getDefaultDrillDownDates } from './utils/periodGranularities';
import { fetchProjectData } from './projects/sagas';
import { clearLocation } from './historyNavigation/historyNavigation';
import { decodeLocation } from './historyNavigation/utils';
import { PASSWORD_RESET_PREFIX, VERIFY_EMAIL_PREFIX } from './historyNavigation/constants';

function* watchFetchInitialData() {
  yield take(FETCH_INITIAL_DATA);

  // Login must happen first so that projects return the correct access flags
  yield call(findUserLoggedIn, LOGIN_TYPES.AUTO);
  yield call(fetchProjectData);
  yield call(handleLocationChange, {
    location: getInitialLocation(),
    previousLocation: clearLocation(),
  });
}

function* handleInvalidPermission({ projectCode }) {
  const state = yield select();
  const { isUserLoggedIn } = state.authentication;

  if (isUserLoggedIn) {
    // show project access dialog
    const project = selectProjectByCode(state, projectCode);

    if (Object.keys(project).length > 0) {
      yield put(setRequestingAccess(project));
      yield put(setOverlayComponent('requestProjectAccess'));
      return;
    }

    // handle 404s
    // Todo: handle 404s. Issue: https://github.com/beyondessential/tupaia-backlog/issues/1474
    // eslint-disable-next-line no-console
    console.error('project does not exist - 404');
    return;
  }
  // show login dialog
  yield put(setOverlayComponent(LANDING));
}

function* handleUserPage(userPage, initialComponents) {
  yield put(setOverlayComponent(LANDING));

  switch (userPage) {
    case PASSWORD_RESET_PREFIX:
      yield put(setPasswordResetToken(initialComponents[URL_COMPONENTS.PASSWORD_RESET_TOKEN]));
      yield put(openUserPage(DIALOG_PAGE_ONE_TIME_LOGIN));
      break;
    case VERIFY_EMAIL_PREFIX:
      yield put(setVerifyEmailToken(initialComponents[URL_COMPONENTS.VERIFY_EMAIL_TOKEN]));
      break;
    default:
      // eslint-disable-next-line no-console
      console.error('Unhandled user page', userPage);
  }
}

const URL_REFRESH_COMPONENTS = {
  [URL_COMPONENTS.PROJECT]: setProject,
  [URL_COMPONENTS.ORG_UNIT]: setOrgUnit,
  [URL_COMPONENTS.MAP_OVERLAY]: setMapOverlay,
  [URL_COMPONENTS.REPORT]: openEnlargedDialog,
  [URL_COMPONENTS.MEASURE_PERIOD]: updateCurrentMeasureConfigOnceHierarchyLoads,
};

function* handleLocationChange({ location, previousLocation }) {
  const { project } = yield select();
  const { userPage, projectSelector, ...otherComponents } = decodeLocation(location);

  if (userPage) {
    yield call(handleUserPage, userPage, otherComponents);
    return;
  }

  if (projectSelector) {
    // Set project to explore, this is the default
    yield put(setOverlayComponent(LANDING));
    yield put(setProject(DEFAULT_PROJECT_CODE));
    return;
  }

  const hasAccess = project.projects
    .filter(p => p.hasAccess)
    .find(p => p.code === otherComponents.PROJECT);
  if (!hasAccess) {
    yield call(handleInvalidPermission, { projectCode: otherComponents.PROJECT });
    return;
  }

  const isLandingPageProject = PROJECTS_WITH_LANDING_PAGES[otherComponents[URL_COMPONENTS.PROJECT]];
  if (isLandingPageProject) {
    yield put(setOverlayComponent(PROJECT_LANDING));
  }

  // refresh data if the url has changed
  const previousComponents = decodeLocation(previousLocation);
  for (const [key, value] of Object.entries(URL_REFRESH_COMPONENTS)) {
    const component = otherComponents[key];
    if (component && component !== previousComponents[key]) {
      yield put({ ...value(component), meta: { preventHistoryUpdate: true } });
    }
  }
}

function* watchHandleLocationChange() {
  yield takeLatest(LOCATION_CHANGE, handleLocationChange);
}

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
    yield put(findLoggedIn(LOGIN_TYPES.MANUAL, response.emailVerified));
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    if (errorMessage?.error === 'Email address not yet verified') {
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
      fetchResetTokenLoginError,
      fetchOptions,
      requestContext,
      false,
    );

    yield put(findLoggedIn(LOGIN_TYPES.TOKEN, true)); // default to email verified for one time login to prevent a nag screen
    yield put(fetchResetTokenLoginSuccess());
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

function* watchAttemptTokenLogin() {
  yield takeLatest(ATTEMPT_RESET_TOKEN_LOGIN, attemptTokenLogin);
}

function* watchAttemptTokenLoginSuccess() {
  yield takeLatest(FETCH_RESET_TOKEN_LOGIN_SUCCESS, resetToHome);
}

function* openResetPasswordDialog() {
  yield put(openUserPage(DIALOG_PAGE_RESET_PASSWORD));
}

function* watchFetchResetTokenLoginSuccess() {
  // TODO:
  // After #770 is done, this chaining would be better suited to something like a 'redirectTo' after login argument
  // which would take you to the url of this dialog page. For now, we need to call an action to display it
  yield takeLatest(FETCH_RESET_TOKEN_LOGIN_SUCCESS, openResetPasswordDialog);
}

/**
 * attemptRequestCountryAccess
 *
 * Attempt to request country access for the logged in user and call action on success/fail.
 *
 */
function* attemptRequestCountryAccess(action) {
  const { message, projectCode } = action;
  const entityIds = action.entityIds ? Object.keys(action.entityIds) : [];

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entityIds,
      message,
      projectCode,
    }),
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'requestCountryAccess';
  try {
    yield call(request, requestResourceUrl, fetchRequestCountryAccessError, options);
    yield put(fetchRequestCountryAccessSuccess());
    yield call(fetchProjectData);
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

function* watchRequestProjectAccess() {
  yield takeLatest(REQUEST_PROJECT_ACCESS, fetchCountryAccessDataIfRequired);
}

/**
 * fetchOrgUnitData
 *
 * Fetch an org unit.
 *
 */
function* fetchOrgUnitData(organisationUnitCode, projectCode) {
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
    if (error.errorFunction) {
      yield put(error.errorFunction(error));
    }
    yield put(fetchOrgUnitError(organisationUnitCode, error.message));

    throw error;
  }
}

function* requestOrgUnit(action) {
  const state = yield select();
  const activeProjectCode = selectCurrentProjectCode(state);
  const { organisationUnitCode = activeProjectCode } = action;
  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  if (orgUnit && orgUnit.isComplete) {
    return; // If we already have the complete org unit in reduxStore, just exit early
  }

  yield fetchOrgUnitData(organisationUnitCode, activeProjectCode);
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
      selectCurrentProjectCode(state),
    );
    yield put(
      changeOrgUnitSuccess(
        normaliseCountryHierarchyOrgUnitData(orgUnitData),
        shouldChangeMapBounds,
      ),
    );
  } catch (error) {
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
  yield takeLatest(SET_ORG_UNIT, fetchOrgUnitDataAndChangeOrgUnit);
}

/**
 * fetchDashboards
 *
 * Fetches a dashboard for the orgUnit given in action
 *
 */
function* fetchDashboards(action) {
  const { organisationUnitCode } = action.organisationUnit;
  const state = yield select();
  const projectCode = selectCurrentProjectCode(state);
  const project = selectCurrentProject(state);
  const currentDashboardName = selectCurrentDashboardNameFromLocation(state);
  const queryParameters = {
    organisationUnitCode,
    projectCode,
  };
  const requestResourceUrl = `dashboards?${queryString.stringify(queryParameters)}`;

  try {
    const dashboards = yield call(request, requestResourceUrl, fetchDashboardError);

    // If there is no dashboard code defined, assign the default if it is valid for the user
    if (!currentDashboardName) {
      const projectDefaultDashboardName = project.dashboardGroupName;
      const dashboard = dashboards.find(d => d.dashboardName === projectDefaultDashboardName);
      if (dashboard) {
        yield put(setDashboardGroup(project.dashboardGroupName));
      }
    } else {
      const dashboard = dashboards.find(d => d.dashboardName === currentDashboardName);
      // Check if the user has permission to view the dashboard
      if (!dashboard) {
        yield call(handleInvalidPermission, { projectCode });
        return;
      }
    }

    yield put(fetchDashboardsSuccess(dashboards));
  } catch (error) {
    console.log('error', error);
    yield put(error.errorFunction(error));
  }
}

function* watchOrgUnitChangeAndFetchDashboard() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchDashboards);
}

function* fetchViewData(parameters, errorHandler) {
  const { infoViewKey } = parameters;
  const state = yield select();
  const viewConfig = selectViewConfig(state, infoViewKey);
  // If the view should be constrained to a date range and isn't, constrain it
  const { startDate, endDate } =
    parameters.startDate || parameters.endDate ? parameters : getDefaultDates(viewConfig);

  // Build the request url
  const {
    organisationUnitCode,
    dashboardCode,
    itemCode,
    isExpanded,
    extraUrlParameters,
  } = parameters;
  const { reportCode, legacy } = viewConfig;
  const urlParameters = {
    organisationUnitCode,
    projectCode: selectCurrentProjectCode(state),
    legacy,
    dashboardCode,
    itemCode,
    isExpanded,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    timeZone: getBrowserTimeZone(),
    ...extraUrlParameters,
  };
  const requestResourceUrl = `report/${reportCode}?${queryString.stringify(urlParameters)}`;

  try {
    return yield call(request, requestResourceUrl, errorHandler);
  } catch (error) {
    let errorMessage = error.message;

    if (error.errorFunction) {
      yield put(error.errorFunction(error));
    }

    if (error.response) {
      const json = yield error.response.json();
      errorMessage = json.error;
    }

    if (errorHandler) {
      yield put(errorHandler(errorMessage, infoViewKey));
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
  const { infoViewKey } = action;
  const state = yield select();
  const project = selectCurrentProjectCode(state);

  // Run preparation saga if it exists to collect module specific url parameters
  let extraUrlParameters = {};
  if (project === 'disaster') {
    extraUrlParameters = yield call(fetchDisasterDateRange);
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
    yield put(fetchSearchSuccess([], false));
  } else {
    const state = yield select();
    const startIndex = state.searchBar.searchResults?.length || 0; // Send start index to allow loading more search results
    const urlParameters = {
      criteria: action.searchString || state.searchBar.searchString,
      limit: 5,
      projectCode: selectCurrentProjectCode(state),
      startIndex,
    };
    const requestResourceUrl = `organisationUnitSearch?${queryString.stringify(urlParameters)}`;
    try {
      const { searchResults, hasMoreResults } = yield call(request, requestResourceUrl);
      yield put(fetchSearchSuccess(searchResults, hasMoreResults));
    } catch (error) {
      yield put(fetchSearchError(error));
    }
  }
}

function* watchSearchChange() {
  yield takeLatest(CHANGE_SEARCH, fetchSearchData);
}

function* watchFetchMoreSearchResults() {
  yield takeLatest(FETCH_MORE_SEARCH_RESULTS, fetchSearchData);
}

/**
 * fetchMeasureInfo
 *
 * Fetches data for a measure and write it to map state by calling fetchMeasureSuccess.
 *
 */
// TODO: PHX-1 set multiple overlay period in URL, currently use the first selected map overlay period
function* fetchMeasureInfo() {
  const state = yield select();
  const mapOverlayIds = selectCurrentMapOverlayIds(state);
  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  const measureParams = mapOverlayIds.length > 0 && selectMapOverlayById(state, mapOverlayIds[0]);

  if (!organisationUnitCode || !measureParams) {
    // Don't try and fetch null measures
    yield put(cancelFetchMeasureData());
    return;
  }

  const country = selectOrgUnitCountry(state, organisationUnitCode);
  const countryCode = country ? country.organisationUnitCode : undefined;

  const activeProjectCode = selectCurrentProjectCode(state);

  // If the view should be constrained to a date range and isn't, constrain it
  const { startDate, endDate } =
    measureParams.startDate || measureParams.endDate
      ? measureParams
      : getDefaultDates(measureParams);

  const urlParameters = {
    mapOverlayIds: mapOverlayIds.join(','),
    organisationUnitCode,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    shouldShowAllParentCountryResults: !isMobile() && countryCode !== activeProjectCode,
    projectCode: activeProjectCode,
  };
  const requestResourceUrl = `measureData?${queryString.stringify(urlParameters)}`;

  try {
    const measureInfoResponse = yield call(request, requestResourceUrl);
    const measureInfo = processMeasureInfo(measureInfoResponse);

    yield put(fetchMeasureInfoSuccess(measureInfo, countryCode));
  } catch (error) {
    yield put(fetchMeasureInfoError(error));
  }
}

function* watchSetMapOverlayChange() {
  yield takeLatest(SET_MAP_OVERLAY, fetchMeasureInfo);
}

function* watchMeasurePeriodChange() {
  yield takeLatest(UPDATE_MEASURE_CONFIG, fetchMeasureInfo);
}

function* watchTryUpdateMeasureConfigAndWaitForHierarchyLoad() {
  yield takeLatest(
    UPDATE_MEASURE_DATE_RANGE_ONCE_HIERARCHY_LOADS,
    updateMapOverlayDateRangeOnceHierarchyLoads,
  );
}

// TODO: PHX-1 set multiple overlay period in URL, currently use the first selected map overlay
function* updateMapOverlayDateRangeOnceHierarchyLoads(action) {
  yield take(FETCH_MEASURES_SUCCESS);
  const state = yield select();
  const periodGranularity = selectCurrentPeriodGranularity(state);
  const { startDate, endDate } = convertUrlPeriodStringToDateRange(
    action.periodString,
    periodGranularity,
  );
  yield put(updateMeasureConfig(selectCurrentMapOverlayIds(state)[0], { startDate, endDate }));
}

function* fetchCurrentMeasureInfo() {
  const state = yield select();
  const currentOrganisationUnitCode = selectCurrentOrgUnitCode(state);
  const { mapOverlayHierarchy } = state.mapOverlayBar;
  const selectedMapOverlayIds = selectCurrentMapOverlayIds(state);

  if (currentOrganisationUnitCode) {
    if (!checkHierarchyIncludesMapOverlayIds(mapOverlayHierarchy, selectedMapOverlayIds)) {
      const newMapOverlayId = selectDefaultMapOverlayId(state);
      yield put(setMapOverlay(newMapOverlayId));
    }
    yield put(setMapOverlay(selectedMapOverlayIds.join(',')));
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
  const { countryCode } = action.organisationUnit;
  const state = yield select();
  const mapOverlayIds = selectCurrentMapOverlayIds(state);
  const oldOrgUnitCountry = state.map.measureInfo.currentCountry;
  if (oldOrgUnitCountry === countryCode) {
    // We are in the same country as before, no need to refetch measureData
    return;
  }

  if (mapOverlayIds.length > 0) {
    yield put(setMapOverlay(mapOverlayIds.join(',')));
  }
}

function* watchOrgUnitChangeAndFetchMeasureInfo() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchMeasureInfoForNewOrgUnit);
}

/**
 * fetchMapOverlayMetadata
 *
 * Fetch map overlay metadata for current orgUnit for the current user. Written to mapOverlayBar State.
 *
 */
function* fetchMapOverlayMetadata(action) {
  const { organisationUnitCode } = action.organisationUnit;
  const state = yield select();
  if (selectIsProject(state, organisationUnitCode)) yield put(clearMeasure());
  const projectCode = selectCurrentProjectCode(state);
  const requestResourceUrl = `measures?organisationUnitCode=${organisationUnitCode}&projectCode=${projectCode}`;
  try {
    const response = yield call(request, requestResourceUrl);

    if (response.measures.length === 0) yield put(clearMeasure());
    yield put(fetchMeasuresSuccess(response));
  } catch (error) {
    yield put(fetchMeasuresError(error));
  }
}

function* watchOrgUnitChangeAndFetchMeasures() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchMapOverlayMetadata);
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
      yield put(fetchUserLoginSuccess(userData.name, userData.email, action.loginType));
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

/**
 * Fetches enlarged dialog data for a given view, drillDown level and date range.
 */
function* fetchEnlargedDialogData(action) {
  const { options } = action;

  const state = yield select();
  if (selectShouldUseDashboardData(state, options)) {
    const viewConfig = selectCurrentExpandedViewConfig(state);
    const viewData = selectCurrentExpandedViewContent(state);
    yield put(updateEnlargedDialog(options, viewConfig, viewData));
    return;
  }

  const {
    startDate,
    endDate,
    infoViewKey,
    drillDownItemKey,
    // drillDown params
    parameterLink,
    parameterValue,
    drillDownLevel,
  } = options;

  const { organisationUnitCode, dashboardCode, itemCode } = getInfoFromInfoViewKey(infoViewKey);

  let parameters = {
    startDate,
    endDate,
    itemCode,
    organisationUnitCode,
    dashboardCode,
    isExpanded: true,
    infoViewKey,
  };

  // Handle extra drillDown params
  if (drillDownLevel > 0) {
    const { global } = yield select();

    const drillDownViewConfig = global.viewConfigs[drillDownItemKey];
    const drillDownDates = getDefaultDrillDownDates(drillDownViewConfig, startDate, endDate);

    parameters = {
      ...parameters,
      infoViewKey: drillDownItemKey,
      itemCode: drillDownViewConfig.code,
      extraUrlParameters: { drillDownLevel, [parameterLink]: parameterValue },
      startDate: drillDownDates.startDate,
      endDate: drillDownDates.endDate,
    };
  }

  const viewData = yield call(fetchViewData, parameters, updateEnlargedDialogError);

  const newState = yield select();
  const newInfoViewKey = selectCurrentInfoViewKey(newState);

  // If the expanded view has changed, don't update the enlargedDialog's viewContent
  if (viewData && newInfoViewKey === infoViewKey) {
    const viewConfig = drillDownLevel
      ? selectViewConfig(state, drillDownItemKey)
      : selectCurrentExpandedViewConfig(state);
    yield put(updateEnlargedDialog(action.options, viewConfig, viewData));
  }
}

function* watchFetchNewEnlargedDialogData() {
  yield takeLatest(FETCH_ENLARGED_DIALOG_DATA, fetchEnlargedDialogData);
}

function* resetToProjectSplash() {
  yield put(clearMapOverlayHierarchy());
  yield put(setOverlayComponent(LANDING));
  yield put(setProject(DEFAULT_PROJECT_CODE));
}

function* resetToHome() {
  yield put(goHome());
}

function* watchLoginSuccess() {
  yield takeLatest(FETCH_LOGIN_SUCCESS, fetchLoginData);
}

function* watchLogoutSuccess() {
  yield takeLatest(FETCH_LOGOUT_SUCCESS, resetToHome);
}

function* fetchLoginData(action) {
  if (action.loginType === LOGIN_TYPES.MANUAL) {
    const { routing: location } = yield select();
    const { PROJECT, ORG_UNIT } = decodeLocation(location);

    const overlay = PROJECT === 'explore' && ORG_UNIT === 'explore' ? LANDING : null;

    yield put(setOverlayComponent(overlay));
    yield call(fetchProjectData);
    yield call(handleLocationChange, {
      location,
      // Assume an empty location string so that the url will trigger fetching fresh data
      previousLocation: {
        pathname: '',
        search: '',
        hash: '',
      },
    });
  }
}

function* watchGoHomeAndResetToProjectSplash() {
  yield takeLatest(GO_HOME, resetToProjectSplash);
}

function* refreshBrowserWhenFinishingUserSession() {
  yield takeLatest(FINISH_USER_SESSION, () => {
    window.location.reload();
  });
}

// Add all sagas to be loaded
export default [
  watchFetchInitialData,
  watchAttemptChangePasswordAndFetchIt,
  watchAttemptResetPasswordAndFetchIt,
  watchAttemptTokenLoginSuccess,
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
  watchFetchMoreSearchResults,
  watchSetMapOverlayChange,
  watchOrgUnitChangeAndFetchMeasures,
  watchFindUserCurrentLoggedIn,
  watchFetchNewEnlargedDialogData,
  watchLoginSuccess,
  watchLogoutSuccess,
  watchAttemptTokenLogin,
  watchResendEmailVerificationAndFetchIt,
  watchSetVerifyEmailToken,
  watchFetchMeasureSuccess,
  watchChangeOrgUnitSuccess,
  refreshBrowserWhenFinishingUserSession,
  watchRequestProjectAccess,
  watchGoHomeAndResetToProjectSplash,
  watchFetchResetTokenLoginSuccess,
  watchMeasurePeriodChange,
  watchTryUpdateMeasureConfigAndWaitForHierarchyLoad,
  watchHandleLocationChange,
];
