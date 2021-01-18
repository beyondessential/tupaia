/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * reducers
 *
 * Here we define reducers across the app for editing state. They are all combined into the
 * default export rootReducer.
 *
 * In the future we may want to refactor, moving each reducer into the container folder for
 * their respective component.
 */

import { combineReducers } from 'redux';
import map from './reducers/mapReducers';
import disaster from './disaster/reducers';
import project from './projects/reducers';
import orgUnits from './reducers/orgUnitReducers';
import { isMobile, getUniqueViewId } from './utils';
import { LANDING } from './containers/OverlayDiv/constants';
import { EMAIL_VERIFIED_STATUS } from './containers/EmailVerification';
import { getInitialLocation } from './historyNavigation';
import { selectMeasureBarItemCategoryById } from './selectors';

// Import Action Types
import {
  ATTEMPT_CHANGE_PASSWORD,
  ATTEMPT_LOGIN,
  ATTEMPT_SIGNUP,
  ATTEMPT_LOGOUT,
  ATTEMPT_RESET_PASSWORD,
  ATTEMPT_REQUEST_COUNTRY_ACCESS,
  CHANGE_SIDE_BAR_CONTRACTED_WIDTH,
  CHANGE_SIDE_BAR_EXPANDED_WIDTH,
  SET_MEASURE,
  UPDATE_MEASURE_CONFIG,
  CLEAR_MEASURE_HIERARCHY,
  SET_ORG_UNIT,
  CHANGE_SEARCH,
  FETCH_CHANGE_PASSWORD_ERROR,
  FETCH_CHANGE_PASSWORD_SUCCESS,
  FETCH_COUNTRY_ACCESS_DATA_SUCCESS,
  FETCH_COUNTRY_ACCESS_DATA_ERROR,
  FETCH_DASHBOARD_CONFIG_ERROR,
  FETCH_DASHBOARD_CONFIG_SUCCESS,
  FETCH_INFO_VIEW_DATA_ERROR,
  FETCH_INFO_VIEW_DATA_SUCCESS,
  FETCH_INFO_VIEW_DATA,
  FETCH_LOGIN_ERROR,
  RESEND_VERIFICATION_EMAIL,
  FETCH_EMAIL_VERIFY_ERROR,
  FETCH_EMAIL_VERIFY_SUCCESS,
  FETCH_RESEND_EMAIL_ERROR,
  FETCH_LOGIN_SUCCESS,
  SHOW_UNVERIFIED_LOGIN,
  FETCH_LOGOUT_ERROR,
  FETCH_LOGOUT_SUCCESS,
  FETCH_MEASURES_ERROR,
  FETCH_MEASURES_SUCCESS,
  CHANGE_ORG_UNIT_ERROR,
  CHANGE_ORG_UNIT_SUCCESS,
  FETCH_RESET_PASSWORD_ERROR,
  FETCH_RESET_PASSWORD_SUCCESS,
  FETCH_REQUEST_COUNTRY_ACCESS_SUCCESS,
  FETCH_REQUEST_COUNTRY_ACCESS_ERROR,
  FETCH_SEARCH_ERROR,
  FETCH_SEARCH_SUCCESS,
  FETCH_MORE_SEARCH_RESULTS,
  FETCH_SIGNUP_ERROR,
  FETCH_SIGNUP_SUCCESS,
  FINISH_USER_SESSION,
  FIND_USER_LOGGEDIN,
  FIND_USER_LOGIN_FAILED,
  GO_HOME,
  CLOSE_DROPDOWN_OVERLAYS,
  SHOW_SERVER_UNREACHABLE_ERROR,
  SHOW_SESSION_EXPIRED_ERROR,
  SHOW_TUPAIA_INFO,
  TOGGLE_INFO_PANEL,
  OPEN_USER_DIALOG,
  CLOSE_USER_DIALOG,
  TOGGLE_MEASURE_EXPAND,
  TOGGLE_SEARCH_EXPAND,
  SET_OVERLAY_COMPONENT,
  OPEN_ENLARGED_DIALOG,
  CLOSE_ENLARGED_DIALOG,
  UPDATE_ENLARGED_DIALOG,
  SET_CONFIG_GROUP_VISIBLE,
  FETCH_ENLARGED_DIALOG_DATA,
  UPDATE_ENLARGED_DIALOG_ERROR,
  SET_PASSWORD_RESET_TOKEN,
  TOGGLE_DASHBOARD_SELECT_EXPAND,
  SET_MOBILE_DASHBOARD_EXPAND,
  REQUEST_PROJECT_ACCESS,
  SET_PROJECT_ADDITIONAL_ACCESS,
  SET_PROJECT,
  FETCH_RESET_TOKEN_LOGIN_ERROR,
  SET_ENLARGED_DIALOG_DATE_RANGE,
} from './actions';
import { LOGIN_TYPES } from './constants';

function authentication(
  state = {
    isUserLoggedIn: false,
    isDialogVisible: false,
    dialogPage: '',
    currentUserUsername: 'Public User',
    currentUserEmail: '',
    isRequestingLogin: false,
    loginFailedMessage: null,
    oneTimeLoginFailedMessage: null,
    showSessionExpireDialog: false,
    successMessage: '',
    emailVerified: EMAIL_VERIFIED_STATUS.VERIFIED,
    errors: [],
  },
  action,
) {
  switch (action.type) {
    case OPEN_USER_DIALOG:
      return {
        ...state,
        isDialogVisible: true,
        dialogPage: action.dialogPage,
        successMessage: action.successMessage,
        loginFailedMessage: null,
      };
    case ATTEMPT_LOGOUT:
    case CLOSE_DROPDOWN_OVERLAYS:
    case TOGGLE_SEARCH_EXPAND:
    case CLOSE_USER_DIALOG:
      return {
        ...state,
        isDialogVisible: false,
        dialogPage: '',
      };
    case ATTEMPT_LOGIN:
      return {
        ...state,
        isRequestingLogin: true,
        loginFailedMessage: null,
        successMessage: null,
      };
    case FETCH_LOGIN_SUCCESS:
      return {
        ...state,
        currentUserUsername: action.username,
        currentUserEmail: action.email,
        isUserLoggedIn: true,
        isRequestingLogin: false,
        isDialogVisible: action.loginType === LOGIN_TYPES.MANUAL ? false : state.isDialogVisible,
        emailVerified: state.emailVerified,
      };
    case SHOW_UNVERIFIED_LOGIN:
      return {
        ...state,
        isUserLoggedIn: false,
        isRequestingLogin: false,
        emailVerified: EMAIL_VERIFIED_STATUS.NEW_USER,
      };
    case FETCH_LOGIN_ERROR:
      return {
        ...state,
        isUserLoggedIn: false,
        isRequestingLogin: false,
        loginFailedMessage: 'Wrong e-mail or password',
        errors: action.errors,
      };
    case FETCH_RESET_TOKEN_LOGIN_ERROR:
      return {
        ...state,
        isUserLoggedIn: false,
        isRequestingLogin: false,
        oneTimeLoginFailedMessage: 'Reset token is invalid or already used',
        errors: action.errors,
      };
    case FETCH_EMAIL_VERIFY_SUCCESS:
      return {
        ...state,
        messageFailLogin: '',
        successMessage: action.successMessage,
      };
    case FETCH_EMAIL_VERIFY_ERROR:
      return {
        ...state,
        isUserLoggedIn: false,
        isRequestingLogin: false,
        loginFailedMessage: action.messageFailLogin,
      };
    case RESEND_VERIFICATION_EMAIL:
      return {
        ...state,
        hasSentEmail: true,
        emailVerified: EMAIL_VERIFIED_STATUS.VERIFIED,
      };
    case FETCH_RESEND_EMAIL_ERROR:
      return {
        ...state,
        hasSentEmail: false,
        messageFailEmailVerify:
          action.error ||
          'Something went wrong with your email verification, please check the form and try again',
      };

    case FETCH_SIGNUP_SUCCESS:
      return {
        ...state,
        isRequestingLogin: false,
      };
    case FETCH_LOGOUT_SUCCESS:
      return {
        ...state,
        currentUserUsername: 'Public User',
        currentUserEmail: '',
        isUserLoggedIn: false,
      };
    case FETCH_LOGOUT_ERROR:
      return state;
    case FINISH_USER_SESSION:
      return {
        ...state,
        isUserLoggedIn: false,
        currentUserUsername: 'Public User',
        currentUserEmail: '',
        showSessionExpireDialog: false,
      };
    case FIND_USER_LOGGEDIN:
      return {
        ...state,
        isRequestingLogin: true,
        emailVerified: action.emailVerified,
      };
    case FIND_USER_LOGIN_FAILED:
      return {
        ...state,
        isRequestingLogin: false,
      };
    case SHOW_SESSION_EXPIRED_ERROR:
      return { ...state, showSessionExpireDialog: true };
    default:
      return state;
  }
}

function signup(
  state = {
    isRequestingSignup: false,
    signupFailedMessage: '',
    signupComplete: false,
  },
  action,
) {
  switch (action.type) {
    case OPEN_USER_DIALOG:
      return {
        ...state,
        signupFailedMessage: '',
      };
    case ATTEMPT_SIGNUP:
      return {
        ...state,
        isRequestingSignup: true,
        signupFailedMessage: '',
      };
    case FETCH_SIGNUP_ERROR:
      return {
        ...state,
        isRequestingSignup: false,
        signupFailedMessage:
          action.error ||
          'Something went wrong during sign up, please check the form and try again.',
      };
    case FETCH_SIGNUP_SUCCESS:
      return {
        ...state,
        signupComplete: true,
        isRequestingSignup: false,
        signupFailedMessage: '',
      };
    default:
      return state;
  }
}

function changePassword(
  state = {
    isRequestingChangePassword: false,
    changePasswordFailedMessage: '',
    hasChangePasswordCompleted: false,
    passwordResetToken: '',
  },
  action,
) {
  switch (action.type) {
    case OPEN_USER_DIALOG:
      return {
        ...state,
        changePasswordFailedMessage: '',
      };
    case ATTEMPT_CHANGE_PASSWORD:
      return {
        ...state,
        isRequestingChangePassword: true,
        changePasswordFailedMessage: '',
      };
    case FETCH_CHANGE_PASSWORD_ERROR: {
      const errorMessage =
        state.passwordResetToken.length > 0
          ? 'This password reset link has already been used.'
          : 'Something went wrong during password change, please check the form and try again';
      return {
        ...state,
        isRequestingChangePassword: false,
        changePasswordFailedMessage: action.error || errorMessage,
      };
    }
    case FETCH_CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        hasChangePasswordCompleted: true,
        isRequestingChangePassword: false,
        changePasswordFailedMessage: '',
        passwordResetToken: '',
      };
    case CLOSE_USER_DIALOG:
      return {
        ...state,
        hasChangePasswordCompleted: false,
        changePasswordFailedMessage: '',
      };
    case SET_PASSWORD_RESET_TOKEN:
      return {
        ...state,
        passwordResetToken: action.passwordResetToken,
      };
    default:
      return state;
  }
}

function resetPassword(
  state = {
    isRequestingResetPassword: false,
    resetPasswordFailedMessage: '',
    hasResetPasswordCompleted: false,
  },
  action,
) {
  switch (action.type) {
    case OPEN_USER_DIALOG:
      return {
        ...state,
        hasResetPasswordCompleted: false,
        resetPasswordFailedMessage: '',
      };
    case ATTEMPT_RESET_PASSWORD:
      return {
        ...state,
        isRequestingResetPassword: true,
        resetPasswordFailedMessage: '',
      };
    case FETCH_RESET_PASSWORD_ERROR:
      return {
        ...state,
        isRequestingResetPassword: false,
        resetPasswordFailedMessage:
          action.error ||
          'Something went wrong during password reset, please check the form and try again',
      };
    case FETCH_RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        hasResetPasswordCompleted: true,
        isRequestingResetPassword: false,
        resetPasswordFailedMessage: '',
      };
    default:
      return state;
  }
}

function requestCountryAccess(
  state = {
    countries: [],
    isFetchingCountryAccessData: false,
    isRequestingCountryAccess: false,
    isRequestingAdditionalCountryAccess: false,
    errorMessage: '',
    hasRequestCountryAccessCompleted: false,
  },
  action,
) {
  switch (action.type) {
    case OPEN_USER_DIALOG:
    case REQUEST_PROJECT_ACCESS:
      return {
        ...state,
        isFetchingCountryAccessData: true,
        isRequestingAdditionalCountryAccess: false,
        errorMessage: '',
      };
    case SET_PROJECT_ADDITIONAL_ACCESS:
      return {
        ...state,
        isRequestingAdditionalCountryAccess: true,
        errorMessage: '',
      };
    case FETCH_COUNTRY_ACCESS_DATA_ERROR:
      return {
        ...state,
        isFetchingCountryAccessData: false,
        isRequestingAdditionalCountryAccess: false,
        errorMessage: action.error || 'Something went wrong while fetching country access data',
      };
    case FETCH_COUNTRY_ACCESS_DATA_SUCCESS:
      return {
        ...state,
        countries: action.countries,
        isFetchingCountryAccessData: false,
        errorMessage: '',
      };
    case ATTEMPT_REQUEST_COUNTRY_ACCESS:
      return {
        ...state,
        isRequestingCountryAccess: true,
        errorMessage: '',
      };
    case FETCH_REQUEST_COUNTRY_ACCESS_ERROR:
      return {
        ...state,
        isRequestingCountryAccess: false,
        isRequestingAdditionalCountryAccess: false,
        errorMessage:
          action.error ||
          'Something went wrong during country access request, please check the form and try again',
      };
    case FETCH_REQUEST_COUNTRY_ACCESS_SUCCESS:
      return {
        ...state,
        hasRequestCountryAccessCompleted: true,
        isRequestingCountryAccess: false,
        isRequestingAdditionalCountryAccess: false,
        errorMessage: '',
      };
    case CLOSE_USER_DIALOG:
      return {
        ...state,
        hasRequestCountryAccessCompleted: false,
        isRequestingAdditionalCountryAccess: false,
        errorMessage: '',
      };
    default:
      return state;
  }
}

function dashboard(
  state = {
    viewResponses: {},
    contractedWidth: 300, // Set dynamically based on window size.
    expandedWidth: 300, // Overridden by info div.
    isGroupSelectExpanded: false,
    isMobileDashboardExpanded: false,
  },
  action,
) {
  switch (action.type) {
    case FETCH_INFO_VIEW_DATA:
      return state;
    case FETCH_INFO_VIEW_DATA_SUCCESS: {
      const { infoViewKey, response } = action;
      const viewResponses = { ...state.viewResponses };
      viewResponses[infoViewKey] = response;
      return { ...state, viewResponses };
    }
    case FETCH_INFO_VIEW_DATA_ERROR: {
      const { infoViewKey, error } = action;
      const viewResponses = { ...state.viewResponses };
      viewResponses[infoViewKey] = { error };
      return { ...state, viewResponses };
    }
    case CHANGE_SIDE_BAR_CONTRACTED_WIDTH:
      return { ...state, contractedWidth: action.contractedWidth };
    case CHANGE_SIDE_BAR_EXPANDED_WIDTH:
      return { ...state, expandedWidth: action.expandedWidth };
    case SET_CONFIG_GROUP_VISIBLE:
      return {
        ...state,
        hiddenDashboardGroups: {
          ...state.hiddenDashboardGroups,
          [action.groupName]: !action.isVisible,
        },
      };
    case TOGGLE_DASHBOARD_SELECT_EXPAND:
      return { ...state, isGroupSelectExpanded: !state.isGroupSelectExpanded };
    case SET_MOBILE_DASHBOARD_EXPAND:
      return { ...state, isMobileDashboardExpanded: action.shouldExpand };
    case SET_PROJECT:
      return { ...state, viewResponses: {} };
    default:
      return state;
  }
}

function searchBar(
  state = {
    isExpanded: false,
    isLoadingSearchResults: false,
    searchResults: [],
    hasMoreResults: false,
    searchString: '',
  },
  action,
) {
  switch (action.type) {
    case TOGGLE_SEARCH_EXPAND:
      return { ...state, isExpanded: !state.isExpanded };
    case FETCH_SEARCH_SUCCESS:
      return {
        ...state,
        isLoadingSearchResults: false,
        searchResults: [...(state.searchResults || []), ...(action.searchResults || [])], // Append more search results
        hasMoreResults: action.hasMoreResults,
      };
    case FETCH_MORE_SEARCH_RESULTS:
      return { ...state, isLoadingSearchResults: true };
    case CHANGE_SEARCH:
      return {
        ...state,
        isLoadingSearchResults: true,
        searchResults: [],
        hasMoreResults: false,
        searchString: action.searchString,
      };
    case FETCH_SEARCH_ERROR:
      return {
        ...state,
        isLoadingSearchResults: false,
        searchResults: action.error,
        hasMoreResults: false,
      };
    case CLOSE_DROPDOWN_OVERLAYS:
      return { ...state, isExpanded: false };
    case FETCH_LOGIN_SUCCESS:
      // Clear search results on login incase of permission change
      return {
        ...state,
        isExpanded: false,
        isLoadingSearchResults: false,
        searchResults: [],
        hasMoreResults: false,
        searchString: '',
      };
    case FETCH_LOGOUT_SUCCESS:
      // Clear search results on logout incase of permission change
      return {
        ...state,
        isExpanded: false,
        isLoadingSearchResults: false,
        searchResults: [],
        hasMoreResults: false,
        searchString: '',
      };
    case SET_PROJECT:
      // Clear search results on project change to fetch alternative hierarchy
      return {
        ...state,
        isExpanded: false,
        isLoadingSearchResults: false,
        searchResults: [],
        hasMoreResults: false,
        searchString: '',
      };
    default:
      return state;
  }
}

function measureBar(
  state = {
    isExpanded: false,
    measureHierarchy: [],
    error: null,
  },
  action,
) {
  switch (action.type) {
    case CLEAR_MEASURE_HIERARCHY:
      return { ...state, measureHierarchy: [] };
    case SET_MEASURE:
      return {
        ...state,
        hiddenMeasures: {},
      };
    case UPDATE_MEASURE_CONFIG: {
      const { categoryIndex, measure, measureIndex } = selectMeasureBarItemCategoryById(
        { measureBar: state },
        action.measureId,
      );

      const measureHierarchy = [...state.measureHierarchy];

      measureHierarchy[categoryIndex].children[measureIndex] = {
        ...measure,
        ...action.measureConfig,
      };

      return {
        ...state,
        measureHierarchy,
      };
    }
    case TOGGLE_MEASURE_EXPAND:
      return { ...state, isExpanded: !state.isExpanded };
    case FETCH_MEASURES_SUCCESS:
      return {
        ...state,
        measureHierarchy: action.response.measures,
        error: null,
      };
    case FETCH_MEASURES_ERROR:
      return { ...state, error: action.error };
    default:
      return state;
  }
}

function global(
  state = {
    isSidePanelExpanded: false,
    overlay: null,
    dashboardConfig: {},
    viewConfigs: {},
    isLoadingOrganisationUnit: false,
  },
  action,
) {
  switch (action.type) {
    case TOGGLE_INFO_PANEL:
      return { ...state, isSidePanelExpanded: !state.isSidePanelExpanded };
    case GO_HOME:
      return {
        ...state,
        isSidePanelExpanded: false,
        overlay: !isMobile() && LANDING,
      };
    case SHOW_TUPAIA_INFO:
      return {
        ...state,
        isSidePanelExpanded: true,
      };
    case SET_ORG_UNIT:
      return {
        ...state,
        isLoadingOrganisationUnit: true,
      };
    case CHANGE_ORG_UNIT_SUCCESS:
      return {
        ...state,
        isLoadingOrganisationUnit: false,
      };
    case CHANGE_ORG_UNIT_ERROR:
      return { ...state, isLoadingOrganisationUnit: false };
    case FETCH_DASHBOARD_CONFIG_SUCCESS: {
      const { dashboardConfig } = action;
      const viewConfigs = extractViewsFromAllDashboards(dashboardConfig);
      return { ...state, dashboardConfig, viewConfigs };
    }
    case FETCH_DASHBOARD_CONFIG_ERROR:
      return state;
    case SHOW_SERVER_UNREACHABLE_ERROR:
      return state;
    case SET_OVERLAY_COMPONENT:
      return { ...state, overlay: action.component };
    case SET_PROJECT:
      return { ...state, dashboardConfig: {}, viewConfigs: {} };
    default:
      return state;
  }
}

function enlargedDialog(
  state = {
    isLoading: false,
    contentByLevel: null,
    errorMessage: '',
    drillDownDatesByLevel: null,
  },
  action,
) {
  switch (action.type) {
    case OPEN_ENLARGED_DIALOG:
      return {
        ...state,
        isLoading: false,
        errorMessage: '',
        contentByLevel: null,
      };
    case CLOSE_ENLARGED_DIALOG:
      return {
        ...state,
        isLoading: false,
        errorMessage: '',
        contentByLevel: null,
      };
    case SET_ENLARGED_DIALOG_DATE_RANGE: {
      const { drillDownLevel, startDate, endDate } = action;

      // Base level dates are stored in the url
      if (drillDownLevel === 0) return state;

      return {
        ...state,
        drillDownDatesByLevel: {
          ...(state.drillDownDatesByLevel || {}),
          [drillDownLevel]: {
            startDate,
            endDate,
          },
        },
      };
    }
    case FETCH_ENLARGED_DIALOG_DATA:
      return {
        ...state,
        isLoading: true,
      };
    case UPDATE_ENLARGED_DIALOG:
      return {
        ...state,
        contentByLevel: {
          ...(state.contentByLevel || {}),
          [action.options.drillDownLevel]: {
            viewContent: action.viewContent,
            options: action.options,
          },
        },
        isLoading: false,
        errorMessage: '',
      };
    case UPDATE_ENLARGED_DIALOG_ERROR:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.errorMessage,
      };
    default:
      return state;
  }
}

function routing(state = getInitialLocation(), action) {
  if (action.type === 'UPDATE_HISTORY_LOCATION') {
    return action.location;
  }
  return state;
}

/**
 * Reach into the dashboard config, and pull out all views from every dashboard group/permission
 * level, then return them keyed by unique view id
 * @param {object}  dashboardConfig The dashboard config object returned by `/dashboard` endpoint
 * @return {object} viewConfigs     Config for every view, keyed by unique view id
 */
function extractViewsFromAllDashboards(dashboardConfig) {
  const viewConfigs = {};
  Object.values(dashboardConfig).forEach(dashboardGroups =>
    Object.values(dashboardGroups).forEach(({ dashboardGroupId, organisationUnitCode, views }) => {
      views.forEach(view => {
        const uniqueViewId = getUniqueViewId({
          dashboardGroupId,
          organisationUnitCode,
          viewId: view.drillDownLevel ? `${view.viewId}_${view.drillDownLevel}` : view.viewId,
        });
        viewConfigs[uniqueViewId] = view;
      });
    }),
  );
  return viewConfigs;
}

// Add all additional reducers here!
export default combineReducers({
  map,
  authentication,
  dashboard,
  searchBar,
  measureBar,
  global,
  signup,
  changePassword,
  resetPassword,
  requestCountryAccess,
  enlargedDialog,
  disaster,
  project,
  orgUnits,
  routing,
});
