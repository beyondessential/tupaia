/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * actions
 *
 * Here we define actions across the app for triggering state changes.
 * Each action is it's own exported function. All actions are synchronous, but some triggering
 * asynchronous sagas to fetch data.
 *
 * In the future we may want to refactor, moving each action into the appropriate container folder.
 */

export const FETCH_INITIAL_DATA = 'FETCH_INITIAL_DATA';
export const ATTEMPT_CHANGE_PASSWORD = 'ATTEMPT_CHANGE_PASSWORD';
export const ATTEMPT_LOGIN = 'ATTEMPT_LOGIN';
export const ATTEMPT_LOGOUT = 'ATTEMPT_LOGOUT';
export const ATTEMPT_RESET_PASSWORD = 'ATTEMPT_RESET_PASSWORD';
export const RESEND_VERIFICATION_EMAIL = 'RESEND_VERIFICATION_EMAIL';
export const FETCH_RESEND_VERIFICATION_EMAIL = 'FETCH_RESEND_VERIFICATION_EMAIL';
export const FETCH_EMAIL_VERIFY_ERROR = 'FETCH_EMAIL_VERIFY_ERROR';
export const FETCH_EMAIL_VERIFY_SUCCESS = 'FETCH_EMAIL_VERIFY_SUCCESS';
export const SET_VERIFY_EMAIL_TOKEN = 'SET_VERIFY_EMAIL_TOKEN';
export const FETCH_RESEND_EMAIL_ERROR = 'FETCH_RESEND_EMAIL_ERROR';
export const DIALOG_PAGE_VERIFICATION_PAGE = 'DIALOG_PAGE_VERIFICATION_PAGE';
export const ATTEMPT_REQUEST_COUNTRY_ACCESS = 'ATTEMPT_REQUEST_COUNTRY_ACCESS';
export const ATTEMPT_SIGNUP = 'ATTEMPT_SIGNUP';
export const SET_DASHBOARD_GROUP = 'SET_DASHBOARD_GROUP';
export const ATTEMPT_RESET_TOKEN_LOGIN = 'ATTEMPT_RESET_TOKEN_LOGIN';
export const CHANGE_SIDE_BAR_CONTRACTED_WIDTH = 'CHANGE_SIDE_BAR_CONTRACTED_WIDTH';
export const CHANGE_SIDE_BAR_EXPANDED_WIDTH = 'CHANGE_SIDE_BAR_EXPANDED_WIDTH';
export const CLEAR_MEASURE_HIERARCHY = 'CLEAR_MEASURE_HIERARCHY';
export const SET_MEASURE = 'SET_MEASURE';
export const UPDATE_MEASURE_CONFIG = 'UPDATE_MEASURE_CONFIG';
export const REQUEST_ORG_UNIT = 'REQUEST_ORG_UNIT';
export const FETCH_ORG_UNIT = 'FETCH_ORG_UNIT';
export const SET_ORG_UNIT = 'SET_ORG_UNIT';
export const CHANGE_POSITION = 'CHANGE_POSITION';
export const CHANGE_BOUNDS = 'CHANGE_BOUNDS';
export const CHANGE_SEARCH = 'CHANGE_SEARCH';
export const FETCH_MORE_SEARCH_RESULTS = 'FETCH_MORE_SEARCH_RESULTS';
export const CHANGE_TILE_SET = 'CHANGE_TILE_SET';
export const CHANGE_ZOOM = 'CHANGE_ZOOM';
export const CLEAR_MEASURE = 'CLEAR_MEASURE';
export const HIDE_MAP_MEASURE = 'HIDE_MAP_MEASURE';
export const UNHIDE_MAP_MEASURE = 'UNHIDE_MAP_MEASURE';
export const UPDATE_DEFAULT_MEASURE = 'UPDATE_DEFAULT_MEASURE';
export const FETCH_CHANGE_PASSWORD_ERROR = 'FETCH_CHANGE_PASSWORD_ERROR';
export const FETCH_CHANGE_PASSWORD_SUCCESS = 'FETCH_CHANGE_PASSWORD_SUCCESS';
export const FETCH_COUNTRY_ACCESS_DATA_SUCCESS = 'FETCH_COUNTRY_ACCESS_DATA_SUCCESS';
export const FETCH_COUNTRY_ACCESS_DATA_ERROR = 'FETCH_COUNTRY_ACCESS_DATA_ERROR';
export const FETCH_DASHBOARD_CONFIG_ERROR = 'FETCH_DASHBOARD_CONFIG_ERROR';
export const FETCH_DASHBOARD_CONFIG_SUCCESS = 'FETCH_DASHBOARD_CONFIG_SUCCESS';
export const FETCH_INFO_VIEW_DATA = 'FETCH_INFO_VIEW_DATA';
export const FETCH_INFO_VIEW_DATA_ERROR = 'FETCH_INFO_VIEW_DATA_ERROR';
export const FETCH_INFO_VIEW_DATA_SUCCESS = 'FETCH_INFO_VIEW_DATA_SUCCESS';
export const FETCH_LOGIN_ERROR = 'FETCH_LOGIN_ERROR';
export const FIND_USER_LOGIN_FAILED = 'FIND_USER_LOGIN_FAILED';
export const FETCH_LOGIN_SUCCESS = 'FETCH_LOGIN_SUCCESS';
export const FETCH_RESET_TOKEN_LOGIN_ERROR = 'FETCH_RESET_TOKEN_LOGIN_ERROR';
export const FETCH_RESET_TOKEN_LOGIN_SUCCESS = 'FETCH_RESET_TOKEN_LOGIN_SUCCESS';
export const FETCH_LOGOUT_ERROR = 'FETCH_LOGOUT_ERROR';
export const FETCH_LOGOUT_SUCCESS = 'FETCH_LOGOUT_SUCCESS';
export const FETCH_MEASURE_DATA_ERROR = 'FETCH_MEASURE_DATA_ERROR';
export const FETCH_MEASURE_DATA_SUCCESS = 'FETCH_MEASURE_DATA_SUCCESS';
export const CANCEL_FETCH_MEASURE_DATA = 'CANCEL_FETCH_MEASURE_DATA';
export const FETCH_MEASURES_ERROR = 'FETCH_MEASURES_ERROR';
export const FETCH_MEASURES_SUCCESS = 'FETCH_MEASURES_SUCCESS';
export const CHANGE_ORG_UNIT_ERROR = 'CHANGE_ORG_UNIT_ERROR';
export const FETCH_REGION_ERROR = 'FETCH_REGION_ERROR';
export const FETCH_ORG_UNIT_SUCCESS = 'FETCH_ORG_UNIT_SUCCESS';
export const FETCH_ORG_UNIT_ERROR = 'FETCH_ORG_UNIT_ERROR';
export const CHANGE_ORG_UNIT_SUCCESS = 'CHANGE_ORG_UNIT_SUCCESS';
export const FETCH_RESET_PASSWORD_ERROR = 'FETCH_RESET_PASSWORD_ERROR';
export const FETCH_RESET_PASSWORD_SUCCESS = 'FETCH_RESET_PASSWORD_SUCCESS';
export const FETCH_REQUEST_COUNTRY_ACCESS_SUCCESS = 'FETCH_REQUEST_COUNTRY_ACCESS_SUCCESS';
export const FETCH_REQUEST_COUNTRY_ACCESS_ERROR = 'FETCH_REQUEST_COUNTRY_ACCESS_ERROR';
export const FETCH_SEARCH_ERROR = 'FETCH_SEARCH_ERROR';
export const FETCH_SEARCH_SUCCESS = 'FETCH_SEARCH_SUCCESS';
export const FETCH_SIGNUP_ERROR = 'FETCH_SIGNUP_ERROR';
export const SHOW_UNVERIFIED_LOGIN = 'SHOW_UNVERIFIED_LOGIN';
export const FETCH_SIGNUP_SUCCESS = 'FETCH_SIGNUP_SUCCESS';
export const FIND_USER_LOGGEDIN = 'FIND_USER_LOGGEDIN';
export const FINISH_USER_SESSION = 'FINISH_USER_SESSION';
export const GO_HOME = 'GO_HOME';
export const CLOSE_DROPDOWN_OVERLAYS = 'CLOSE_DROPDOWN_OVERLAYS';
export const SET_MAP_IS_ANIMATING = 'SET_MAP_IS_ANIMATING';
export const SHOW_SERVER_UNREACHABLE_ERROR = 'SHOW_SERVER_UNREACHABLE_ERROR';
export const SHOW_SESSION_EXPIRED_ERROR = 'SHOW_SESSION_EXPIRED_ERROR';
export const SHOW_TUPAIA_INFO = 'SHOW_TUPAIA_INFO';
export const TOGGLE_INFO_PANEL = 'TOGGLE_INFO_PANEL';
export const TOGGLE_LOCATION_ITEM_EXPANDED = 'TOGGLE_LOCATION_ITEM_EXPANDED';
export const OPEN_USER_DIALOG = 'OPEN_USER_DIALOG';
export const CLOSE_USER_DIALOG = 'CLOSE_USER_DIALOG';
export const TOGGLE_MEASURE_EXPAND = 'TOGGLE_MEASURE_EXPAND';
export const TOGGLE_MEASURE_ITEM_EXPANDED = 'TOGGLE_MEASURE_ITEM_EXPANDED';
export const TOGGLE_SEARCH_EXPAND = 'TOGGLE_SEARCH_EXPAND';
export const SET_OVERLAY_COMPONENT = 'SET_OVERLAY_COMPONENT';
export const OPEN_MAP_POPUP = 'OPEN_MAP_POPUP';
export const CLOSE_MAP_POPUP = 'CLOSE_MAP_POPUP';
export const DIALOG_PAGE_CHANGE_PASSWORD = 'DIALOG_PAGE_CHANGE_PASSWORD';
export const DIALOG_PAGE_LOGIN = 'DIALOG_PAGE_LOGIN';
export const DIALOG_PAGE_ONE_TIME_LOGIN = 'DIALOG_PAGE_ONE_TIME_LOGIN';
export const DIALOG_PAGE_REQUEST_RESET_PASSWORD = 'DIALOG_PAGE_REQUEST_RESET_PASSWORD';
export const DIALOG_PAGE_REQUEST_COUNTRY_ACCESS = 'DIALOG_PAGE_REQUEST_COUNTRY_ACCESS';
export const DIALOG_PAGE_SIGNUP = 'DIALOG_PAGE_SIGNUP';
export const DIALOG_PAGE_RESET_PASSWORD = 'DIALOG_PAGE_RESET_PASSWORD';
export const OPEN_ENLARGED_DIALOG = 'OPEN_ENLARGED_DIALOG';
export const CLOSE_ENLARGED_DIALOG = 'CLOSE_ENLARGED_DIALOG';
export const FETCH_ENLARGED_DIALOG_DATA = 'FETCH_ENLARGED_DIALOG_DATA';
export const SET_ENLARGED_DIALOG_DATE_RANGE = 'SET_ENLARGED_DIALOG_DATE_RANGE';
export const UPDATE_ENLARGED_DIALOG = 'UPDATE_ENLARGED_DIALOG';
export const UPDATE_ENLARGED_DIALOG_ERROR = 'UPDATE_ENLARGED_DIALOG_ERROR';
export const SET_CONFIG_GROUP_VISIBLE = 'SET_CONFIG_GROUP_VISIBLE';
export const DIALOG_PAGE_USER_MENU = 'DIALOG_PAGE_USER_MENU';
export const SET_PASSWORD_RESET_TOKEN = 'SET_PASSWORD_RESET_TOKEN';
export const SET_DISASTERS_DATA = 'SET_DISASTERS_DATA';
export const FETCH_DISASTERS_ERROR = 'FETCH_DISASTERS_ERROR';
export const SELECT_DISASTER = 'SELECT_DISASTER';
export const VIEW_DISASTER = 'VIEW_DISASTER';
export const TOGGLE_DASHBOARD_SELECT_EXPAND = 'TOGGLE_DASHBOARD_SELECT_EXPAND';
export const SET_MOBILE_DASHBOARD_EXPAND = 'SET_MOBILE_DASHBOARD_EXPAND';
export const SET_PROJECT_DATA = 'SET_PROJECT_DATA';
export const SET_PROJECT = 'SET_PROJECT';
export const FETCH_PROJECTS_ERROR = 'FETCH_PROJECTS_ERROR';
export const REQUEST_PROJECT_ACCESS = 'REQUEST_PROJECT_ACCESS';
export const SET_PROJECT_ADDITIONAL_ACCESS = 'SET_PROJECT_ADDITIONAL_ACCESS';
export const UPDATE_HISTORY_LOCATION = 'UPDATE_HISTORY_LOCATION';
export const UPDATE_MEASURE_DATE_RANGE_ONCE_HIERARCHY_LOADS =
  'UPDATE_MEASURE_DATE_RANGE_ONCE_HIERARCHY_LOADS';
export const LOCATION_CHANGE = 'LOCATION_CHANGE';

/**
 * Attempt password change using old password, new password and new password
 * confirmation by clicking on Change password button.
 *
 * @param  {string} oldPassword Registered user's old password
 * @param  {string} password Registered user's new password
 * @param  {string} passwordConfirm Confirmation of new password
 */
export function attemptChangePassword(oldPassword, password, passwordConfirm, passwordResetToken) {
  return {
    type: ATTEMPT_CHANGE_PASSWORD,
    oldPassword,
    password,
    passwordConfirm,
    passwordResetToken,
  };
}

/**
 * Changes password of the user who is currently logged in
 */
export function fetchChangePasswordSuccess() {
  return {
    type: FETCH_CHANGE_PASSWORD_SUCCESS,
  };
}

/**
 * Changes state to communicate error to change password of the
 * currently logged in user
 *
 * @param {string} errorMessage Response from saga on failed fetch
 */
export function fetchChangePasswordError(errorMessage) {
  return {
    type: FETCH_CHANGE_PASSWORD_ERROR,
    error: errorMessage,
  };
}

/**
 * Attempt login using email and password by clicking on Submit button.
 *
 * @param  {string} emailAdress  Registred user's email
 * @param  {string} password    Registred user's password
 */
export function attemptUserLogin(emailAddress, password) {
  return {
    type: ATTEMPT_LOGIN,
    emailAddress,
    password,
  };
}

/**
 * Changes the current Sign in user. Should update Userbar with username.
 *
 * @param {string} username     Logged user's username
 */
export function fetchUserLoginSuccess(username, email, loginType) {
  return {
    type: FETCH_LOGIN_SUCCESS,
    email,
    username,
    loginType,
  };
}

/**
 * Changes state to communicate error to login some user
 *
 * @param {object} errors  response from saga on failed fetch
 */
export function fetchUserLoginError(errors) {
  return {
    type: FETCH_LOGIN_ERROR,
    errors,
  };
}

/**
 * Attempt login using a one time token.
 *
 * @param  {string} passwordResetToken
 */
export function attemptResetTokenLogin(passwordResetToken) {
  return {
    type: ATTEMPT_RESET_TOKEN_LOGIN,
    passwordResetToken,
  };
}

/**
 * Success logging in with one time token
 */
export function fetchResetTokenLoginSuccess() {
  return {
    type: FETCH_RESET_TOKEN_LOGIN_SUCCESS,
  };
}

/**
 * Changes state to communicate error to login some user
 *
 * @param {object} errors  response from saga on failed fetch
 */
export function fetchResetTokenLoginError(errors) {
  return {
    type: FETCH_RESET_TOKEN_LOGIN_ERROR,
    errors,
  };
}

/**
 * Changes state after attempting to find existing user login without
 * giving the user an error.
 *
 */
export function findUserLoginFailed() {
  return {
    type: FIND_USER_LOGIN_FAILED,
  };
}

/**
 * Attempt logout from current user by clicking on Log out button.
 */
export function attemptUserLogout() {
  return {
    type: ATTEMPT_LOGOUT,
  };
}

/**
 * Changes the current session to logout. Should show Sing in button on UserBar
 */
export function fetchUserLogoutSuccess() {
  return {
    type: FETCH_LOGOUT_SUCCESS,
  };
}

/**
 * Changes state to communicate error to logout current user.
 *
 * @param {object} errors  response from saga on failed fetch
 */
export function fetchUserLogoutError(errors) {
  return {
    type: FETCH_LOGOUT_ERROR,
    errors,
  };
}

export function openEmailVerifiedPage() {
  return {
    type: FETCH_EMAIL_VERIFY_SUCCESS,
    successMessage: 'Your e-mail was verified - Please login below',
  };
}

export function fetchEmailVerifyError() {
  return {
    type: FETCH_EMAIL_VERIFY_ERROR,
    messageFailLogin: 'Your email address could not be verified',
  };
}

export function resendVerificationEmail(email) {
  return {
    type: FETCH_RESEND_VERIFICATION_EMAIL,
    email,
  };
}

export function openResendEmailSuccess() {
  return {
    type: RESEND_VERIFICATION_EMAIL,
  };
}

export function fetchResendEmailError(errorMessage) {
  return {
    type: FETCH_RESEND_EMAIL_ERROR,
    error: errorMessage,
  };
}

export function setVerifyEmailToken(verifyEmailToken) {
  return {
    type: SET_VERIFY_EMAIL_TOKEN,
    verifyEmailToken,
  };
}

/**
 * Attempt password reset using user's email by clicking on reset password button.
 *
 * @param  {string} email Registered user's email
 */
export function attemptResetPassword(email) {
  return {
    type: ATTEMPT_RESET_PASSWORD,
    email,
  };
}

/**
 * Resets user's password
 */
export function fetchResetPasswordSuccess() {
  return {
    type: FETCH_RESET_PASSWORD_SUCCESS,
  };
}

/**
 * Changes state to communicate error to reset password
 *
 * @param {object} errorMessage Response from saga on failed fetch
 */
export function fetchResetPasswordError(errorMessage) {
  return {
    type: FETCH_RESET_PASSWORD_ERROR,
    error: errorMessage,
  };
}

/**
 * Attempt login using email and password by clicking on Submit button.
 *
 * @param  {string} emailAddress  Registered user's email
 * @param  {string} password    Registered user's password
 */
export function attemptUserSignup(fields) {
  return {
    type: ATTEMPT_SIGNUP,
    fields,
  };
}

/**
 * Changes the current Sign in user. Should update Userbar with username.
 *
 * @param {string} username     Logged user's username
 */
export function fetchUserSignupSuccess() {
  return {
    type: FETCH_SIGNUP_SUCCESS,
  };
}

/**
 * Changes state to communicate error to login some user
 *
 * @param {string} error        Error message
 */
export function fetchUserSignupError(error) {
  return {
    type: FETCH_SIGNUP_ERROR,
    error,
  };
}

export function displayUnverified() {
  return {
    type: SHOW_UNVERIFIED_LOGIN,
  };
}

export function fetchCountryAccessDataSuccess(countries) {
  return {
    type: FETCH_COUNTRY_ACCESS_DATA_SUCCESS,
    countries,
  };
}

export function fetchCountryAccessDataError(errorMessage) {
  return {
    type: FETCH_COUNTRY_ACCESS_DATA_ERROR,
    error: errorMessage,
  };
}

/**
 * Attempt country access request for the logged in user using confirmation
 * by clicking on Submit button.
 *
 * @param {array} entityIds The ids of the countries the user requests answers
 * @param {string} message A message describing the reasons access is requested
 * @param {string} userGroup A specific user (permission) group the user is requesting access for
 */
export function attemptRequestCountryAccess(entityIds, message = '', projectCode) {
  return {
    type: ATTEMPT_REQUEST_COUNTRY_ACCESS,
    entityIds,
    message,
    projectCode,
  };
}

/**
 * Submits a country access request
 */
export function fetchRequestCountryAccessSuccess() {
  return {
    type: FETCH_REQUEST_COUNTRY_ACCESS_SUCCESS,
  };
}

/**
 * Changes state to communicate error to request country access for the
 * currently logged in user
 *
 * @param {string} errorMessage Response from saga on failed fetch
 */
export function fetchRequestCountryAccessError(errorMessage) {
  return {
    type: FETCH_REQUEST_COUNTRY_ACCESS_ERROR,
    error: errorMessage,
  };
}

/**
 * Submits a country access request
 */
export function setRequestingAdditionalCountryAccess() {
  return {
    type: SET_PROJECT_ADDITIONAL_ACCESS,
  };
}

/**
 * A request to fetch an org unit by code. Will only fetch if we do not have the orgUnit
 *
 * @param {object} organisationUnit
 */
export function requestOrgUnit(organisationUnitCode) {
  return {
    type: REQUEST_ORG_UNIT,
    organisationUnitCode,
  };
}

/**
 * Fetches an org unit by code. Will update the orgUnitTree.
 *
 * @param {object} organisationUnitCode
 */
export function fetchOrgUnit(organisationUnitCode) {
  return {
    type: FETCH_ORG_UNIT,
    organisationUnitCode,
  };
}

/**
 * Changes the current Organisation Unit. Sets org unit in the url and triggers side effects.
 * Will trigger sagas affecting state for map and the current dashboard.
 *
 * @param {string} organisationUnitCode
 * @param {boolean} shouldChangeMapBounds
 */
export function setOrgUnit(organisationUnitCode, shouldChangeMapBounds = true) {
  return {
    type: SET_ORG_UNIT,
    organisationUnitCode,
    shouldChangeMapBounds,
  };
}

/**
 * Changes position in state, potentially updating map.
 *
 * @param {array} center
 * @param {number} zoom
 */
export function changePosition(center, zoom) {
  return {
    type: CHANGE_POSITION,
    center,
    zoom,
  };
}

export function changeBounds(bounds) {
  return {
    type: CHANGE_BOUNDS,
    bounds,
  };
}

/**
 * Changes current measure, should change features rendered on map after saga data fetch.
 * Updates the current measureId in the url.
 * @param {string} measureId
 */
export function setMeasure(measureId) {
  return {
    type: SET_MEASURE,
    measureId,
  };
}

/**
 * Updates measure config for current measure in measureBar.
 *
 * @param {object} measureConfig
 */
export function updateMeasureConfig(measureId, measureConfig) {
  return {
    type: UPDATE_MEASURE_CONFIG,
    measureId,
    measureConfig,
  };
}

/**
 * Updates measure config for current measure in measureBar once the hierarchy is populated
 *
 * @param {object} measureConfig
 */
export function updateCurrentMeasureConfigOnceHierarchyLoads(periodString) {
  return {
    type: UPDATE_MEASURE_DATE_RANGE_ONCE_HIERARCHY_LOADS,
    periodString,
  };
}

/**
 * Changes current zoomLevel, reflected in map. Adds value to zoomLevel min-max 1-15.
 *
 * @param {number} value
 */
export function changeZoom(value) {
  return {
    type: CHANGE_ZOOM,
    value,
  };
}

/**
 * Changes the tile set url provided to the map component.
 *
 * @param {number} setKey
 */
export function changeTileSet(setKey) {
  return {
    type: CHANGE_TILE_SET,
    setKey,
  };
}

/**
 * Finishes current logged User session - goes back to Public user
 */
export function finishUserSession() {
  return {
    type: FINISH_USER_SESSION,
  };
}

/**
 * Toggles the data panels expanded state.
 */
export function toggleSidePanelExpanded() {
  return {
    type: TOGGLE_INFO_PANEL,
  };
}

/**
 * Toggles visibility of the information overlay.
 */
export function setOverlayComponent(component) {
  return {
    type: SET_OVERLAY_COMPONENT,
    component,
  };
}

/**
 * Changes the current organisationUnit. Should update markers/polygons on map.
 *
 * @param {object} organisationUnit organisationUnit from saga on successful fetch
 */
export function changeOrgUnitSuccess(organisationUnit, shouldChangeMapBounds = true) {
  return {
    type: CHANGE_ORG_UNIT_SUCCESS,
    organisationUnit,
    shouldChangeMapBounds,
  };
}

/**
 * Changes state to communicate error to user appropriately.
 *
 * @param {object} error  response from saga on failed orgUnit change
 */
export function changeOrgUnitError(error) {
  return {
    type: CHANGE_ORG_UNIT_ERROR,
    error,
  };
}

/**
 * Flags a succesful org unit fetch.
 *
 * @param {object} organisationUnit organisationUnit from saga on successful fetch
 */
export function fetchOrgUnitSuccess(organisationUnit) {
  return {
    type: FETCH_ORG_UNIT_SUCCESS,
    organisationUnit,
  };
}

/**
 * Flags a fetch org unit fetch error.
 *
 * @param {object} errorMessage
 */
export function fetchOrgUnitError(organisationUnitCode, errorMessage) {
  return {
    type: FETCH_ORG_UNIT_ERROR,
    organisationUnitCode,
    errorMessage,
  };
}

/**
 * Changes the current dashboardConfig. Change what is rendered in DataPanel.
 *
 * @param {object} dashboardConfig dashboardConfig from saga on successful fetch
 */
export function fetchDashboardSuccess(dashboardConfig) {
  return {
    type: FETCH_DASHBOARD_CONFIG_SUCCESS,
    dashboardConfig,
  };
}

/**
 * Changes state to communicate error to user appropriately.
 *
 * @param {string} errorMessage  response from saga on failed fetch
 */
export function fetchDashboardError(errorMessage) {
  return {
    type: FETCH_DASHBOARD_CONFIG_ERROR,
    errorMessage,
  };
}

/**
 * Fetches data for a DashboardItem.
 *
 * @param {string} infoViewKey
 * @param {string} organisationUnitCode
 * @param {string} dashboardGroupId
 * @param {string} viewId Typically view.viewId from dashboardConfig.tab.subtab
 */

export function fetchDashboardItemData(
  organisationUnitCode,
  dashboardGroupId,
  viewId,
  infoViewKey,
) {
  return {
    type: FETCH_INFO_VIEW_DATA,
    organisationUnitCode,
    dashboardGroupId,
    viewId,
    infoViewKey,
  };
}

/**
 * Stores the DashboardItem data in DataPanel state tree under key named infoViewKey
 *
 * @param {string} infoViewKey
 * @param {object} response response from saga on successful fetch
 */
export function fetchDashboardItemDataSuccess(response, infoViewKey) {
  return {
    type: FETCH_INFO_VIEW_DATA_SUCCESS,
    response,
    infoViewKey,
  };
}

/**
 * Changes state to communicate error to user appropriately.
 *
 * @param {string} infoViewKey
 * @param {object} error
 */
export function fetchDashboardItemDataError(error, infoViewKey) {
  return {
    type: FETCH_INFO_VIEW_DATA_ERROR,
    infoViewKey,
    error,
  };
}

/**
 * Stores measure data in the map state
 *
 * @param {array} response response from saga on successful fetch
 * @param {array} countryCode code of the country from orgUnit of measures
 */
export function fetchMeasureInfoSuccess(response, countryCode) {
  return {
    type: FETCH_MEASURE_DATA_SUCCESS,
    response,
    countryCode,
  };
}

/**
 * Changes state to communicate error to user appropriately.
 *
 * @param {object} error
 */
export function fetchMeasureInfoError(error) {
  return {
    type: FETCH_MEASURE_DATA_ERROR,
    error,
  };
}

export function cancelFetchMeasureData() {
  return {
    type: CANCEL_FETCH_MEASURE_DATA,
  };
}

/**
 * Shows error when current currentUserUsername session expired
 *
 * @param {object} error
 */
export function showSessionExpiredError(error) {
  return {
    type: SHOW_SESSION_EXPIRED_ERROR,
    error,
  };
}

/**
 * Shows error when config server is unreachable
 *
 * @param {object} error
 */
export function showServerUnreachableError(error) {
  return {
    type: SHOW_SERVER_UNREACHABLE_ERROR,
    error,
  };
}

/**
 * Stores measures available in measureBar
 *
 * @param {array} response response from saga on successful fetch
 */
export function fetchMeasuresSuccess(response) {
  return {
    type: FETCH_MEASURES_SUCCESS,
    response,
  };
}

/**
 * Changes state to communicate error to user appropriately.
 *
 * @param {object} error
 */
export function fetchMeasuresError(error) {
  return {
    type: FETCH_MEASURES_ERROR,
    error,
  };
}

/**
 * Shows tupaia info in the bottom infoDiv (Information Area) expanded.
 * Will replace DataPanel (charts) with StaticPage (WhatIsTupaia).
 */
export function showTupaiaInfo() {
  return {
    type: SHOW_TUPAIA_INFO,
  };
}

/**
 * Changes the currently selected Tab in DataPanel
 *
 * @param  {string} name  The dashboard group name (also known as it's key)
 */
export function setDashboardGroup(name) {
  return {
    type: SET_DASHBOARD_GROUP,
    name,
  };
}

/**
 * Fetches search results for given string
 *
 * @param {string} searchString
 */
export function changeSearch(searchString) {
  return {
    type: CHANGE_SEARCH,
    searchString,
  };
}

/**
 * Fetches more search results for given string
 *
 * @param {string} searchString
 */
export function fetchMoreSearchResults() {
  return {
    type: FETCH_MORE_SEARCH_RESULTS,
  };
}

/**
 * Stores the search result in state
 *
 * @param {object} response response from saga on successful fetch
 */
export function fetchSearchSuccess(searchResults, hasMoreResults) {
  return {
    type: FETCH_SEARCH_SUCCESS,
    searchResults,
    hasMoreResults,
  };
}

/**
 * Changes state to communicate search error to user appropriately.
 *
 * @param {object} error
 */
export function fetchSearchError(error) {
  return {
    type: FETCH_SEARCH_ERROR,
    error,
  };
}

/**
 * Toggles the expanded state.
 */
export function toggleMeasureExpand() {
  return {
    type: TOGGLE_MEASURE_EXPAND,
  };
}

/**
 * Toggles the expanded state.
 */
export function toggleDashboardSelectExpand() {
  return {
    type: TOGGLE_DASHBOARD_SELECT_EXPAND,
  };
}

export function setMobileDashboardExpanded(shouldExpand) {
  return {
    type: SET_MOBILE_DASHBOARD_EXPAND,
    shouldExpand,
  };
}

/**
 * Toggles the expanded state.
 */
export function toggleSearchExpand() {
  return {
    type: TOGGLE_SEARCH_EXPAND,
  };
}

/**
 * Takes the user back to World view and closes goes back to small dashboard
 */
export function goHome() {
  return {
    type: GO_HOME,
  };
}

/**
 * Deselects measure and clears markers
 */
export function clearMeasure() {
  return {
    type: CLEAR_MEASURE,
  };
}

/**
 * Blanks out measure hierarchy (for switching between countries)
 */
export function clearMeasureHierarchy() {
  return {
    type: CLEAR_MEASURE_HIERARCHY,
  };
}

export function findLoggedIn(loginType, emailVerified) {
  return {
    type: FIND_USER_LOGGEDIN,
    loginType,
    emailVerified,
  };
}

/**
 * Change the default width of the dashboard content.
 * @param {number} contractedWidth
 */
export function changeSidePanelContractedWidth(contractedWidth) {
  return {
    type: CHANGE_SIDE_BAR_CONTRACTED_WIDTH,
    contractedWidth,
  };
}

/**
 * Change the expanded width of the dashboard content.
 * @param {number} contractedWidth
 */
export function changeSidePanelExpandedWidth(expandedWidth) {
  return {
    type: CHANGE_SIDE_BAR_EXPANDED_WIDTH,
    expandedWidth,
  };
}

/*
 * The map div has been clicked by the user.
 */
export function closeDropdownOverlays() {
  return {
    type: CLOSE_DROPDOWN_OVERLAYS,
  };
}

export function toggleMeasureItemExpanded(itemCode, expanded = true) {
  return {
    type: TOGGLE_MEASURE_ITEM_EXPANDED,
    itemCode,
    expanded,
  };
}

export function toggleLocationItemExpanded(itemCode, expanded = true) {
  return {
    type: TOGGLE_LOCATION_ITEM_EXPANDED,
    itemCode,
    expanded,
  };
}

export function setMapIsAnimating(isAnimating) {
  return {
    type: SET_MAP_IS_ANIMATING,
    isAnimating,
  };
}

export function openUserPage(dialogPage) {
  return {
    type: OPEN_USER_DIALOG,
    dialogPage,
  };
}

export function closeUserPage() {
  return {
    type: CLOSE_USER_DIALOG,
  };
}

export function openMapPopup(orgUnitCode) {
  return {
    type: OPEN_MAP_POPUP,
    orgUnitCode,
  };
}

export function closeMapPopup(orgUnitCode) {
  return {
    type: CLOSE_MAP_POPUP,
    orgUnitCode,
  };
}

export function closeEnlargedDialog() {
  return {
    type: CLOSE_ENLARGED_DIALOG,
  };
}

export function openEnlargedDialog(viewId) {
  return {
    type: OPEN_ENLARGED_DIALOG,
    viewId,
  };
}

export function setPasswordResetToken(passwordResetToken) {
  return {
    type: SET_PASSWORD_RESET_TOKEN,
    passwordResetToken,
  };
}

export function setEnlargedDashboardDateRange(drillDownLevel, startDate, endDate) {
  return {
    type: SET_ENLARGED_DIALOG_DATE_RANGE,
    drillDownLevel,
    startDate,
    endDate,
  };
}

export function fetchEnlargedDialogData(options) {
  return {
    type: FETCH_ENLARGED_DIALOG_DATA,
    options,
  };
}

export function updateEnlargedDialog(options, viewContent) {
  return {
    type: UPDATE_ENLARGED_DIALOG,
    viewContent,
    options,
  };
}

export function updateEnlargedDialogError(errorMessage) {
  return {
    type: UPDATE_ENLARGED_DIALOG_ERROR,
    errorMessage,
  };
}

export function updateHistoryLocation(location) {
  return { type: UPDATE_HISTORY_LOCATION, location };
}
