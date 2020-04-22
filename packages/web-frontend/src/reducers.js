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
import { getMeasureFromHierarchy, isMobile } from './utils';
import { LANDING } from './containers/OverlayDiv';
import { getUniqueViewId } from './utils/getUniqueViewId';
import { EMAIL_VERIFIED_STATUS } from './containers/EmailVerification';

// Import Action Types
import {
  ATTEMPT_CHANGE_PASSWORD,
  ATTEMPT_LOGIN,
  ATTEMPT_SIGNUP,
  ATTEMPT_LOGOUT,
  CHANGE_DASHBOARD_GROUP,
  ATTEMPT_RESET_PASSWORD,
  ATTEMPT_REQUEST_COUNTRY_ACCESS,
  CHANGE_SIDE_BAR_CONTRACTED_WIDTH,
  CHANGE_SIDE_BAR_EXPANDED_WIDTH,
  CHANGE_MEASURE,
  CLEAR_MEASURE_HIERARCHY,
  CHANGE_ORG_UNIT,
  CHANGE_SEARCH,
  CLEAR_MEASURE,
  FETCH_CHANGE_PASSWORD_ERROR,
  FETCH_CHANGE_PASSWORD_SUCCESS,
  FETCH_COUNTRY_ACCESS_DATA_SUCCESS,
  FETCH_COUNTRY_ACCESS_DATA_ERROR,
  FETCH_DASHBOARD_CONFIG_ERROR,
  FETCH_DASHBOARD_CONFIG_SUCCESS,
  FETCH_HIERARCHY_NESTED_ITEMS,
  FETCH_HIERARCHY_NESTED_ITEMS_ERROR,
  FETCH_HIERARCHY_NESTED_ITEMS_SUCCESS,
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
  FETCH_SIGNUP_ERROR,
  FETCH_SIGNUP_SUCCESS,
  FINISH_USER_SESSION,
  FIND_USER_LOGGEDIN,
  FIND_USER_LOGIN_FAILED,
  GO_HOME,
  HIGHLIGHT_ORG_UNIT,
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
  OPEN_EXPORT_DIALOG,
  CLOSE_EXPORT_DIALOG,
  ATTEMPT_CHART_EXPORT,
  FETCH_CHART_EXPORT_SUCCESS,
  FETCH_CHART_EXPORT_ERROR,
  SELECT_CHART_EXPORT_FORMAT,
  OPEN_ENLARGED_DIALOG,
  CLOSE_ENLARGED_DIALOG,
  UPDATE_ENLARGED_DIALOG,
  CLOSE_DRILL_DOWN,
  ATTEMPT_DRILL_DOWN,
  FETCH_DRILL_DOWN_SUCCESS,
  FETCH_DRILL_DOWN_ERROR,
  GO_TO_DRILL_DOWN_LEVEL,
  SET_CONFIG_GROUP_VISIBLE,
  SET_ENLARGED_DIALOG_DATE_RANGE,
  UPDATE_ENLARGED_DIALOG_ERROR,
  SET_PASSWORD_RESET_TOKEN,
  SET_PROJECT,
  TOGGLE_DASHBOARD_SELECT_EXPAND,
  SET_MOBILE_DASHBOARD_EXPAND,
  REQUEST_PROJECT_ACCESS,
} from './actions';

function authentication(
  state = {
    isUserLoggedIn: false,
    isDialogVisible: false,
    dialogPage: '',
    currentUserUsername: 'Public User',
    currentUserEmail: '',
    isRequestingLogin: false,
    loginFailedMessage: null,
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
        isDialogVisible: action.shouldCloseDialog ? false : state.isDialogVisible,
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
    case FETCH_CHANGE_PASSWORD_ERROR:
      return {
        ...state,
        isRequestingChangePassword: false,
        changePasswordFailedMessage:
          action.error ||
          'Something went wrong during password change, please check the form and try again',
      };
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
        errorMessage: '',
      };
    case FETCH_COUNTRY_ACCESS_DATA_ERROR:
      return {
        ...state,
        isFetchingCountryAccessData: false,
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
        errorMessage:
          action.error ||
          'Something went wrong during country access request, please check the form and try again',
      };
    case FETCH_REQUEST_COUNTRY_ACCESS_SUCCESS:
      return {
        ...state,
        hasRequestCountryAccessCompleted: true,
        isRequestingCountryAccess: false,
        errorMessage: '',
      };
    case CLOSE_USER_DIALOG:
      return {
        ...state,
        hasRequestCountryAccessCompleted: false,
        errorMessage: '',
      };
    default:
      return state;
  }
}

function dashboard(
  state = {
    currentDashboardKey: '',
    viewResponses: {},
    contractedWidth: 300, // Set dynamically based on window size.
    expandedWidth: 300, // Overridden by info div.
    isGroupSelectExpanded: false,
    isMobileDashboardExpanded: false,
  },
  action,
) {
  switch (action.type) {
    case CHANGE_DASHBOARD_GROUP:
      return { ...state, currentDashboardKey: action.name };
    case FETCH_INFO_VIEW_DATA:
      return state;
    case FETCH_INFO_VIEW_DATA_SUCCESS: {
      const { infoViewKey, response } = action;
      const viewResponses = { ...state.viewResponses };
      viewResponses[infoViewKey] = response;
      return { ...state, viewResponses };
    }
    case FETCH_INFO_VIEW_DATA_ERROR:
      const { infoViewKey, error } = action;
      const viewResponses = { ...state.viewResponses };
      viewResponses[infoViewKey] = { error };
      return { ...state, viewResponses };
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
    default:
      return state;
  }
}

function searchBar(
  state = {
    isExpanded: false,
    searchResponse: null,
    hierarchyData: null,
    searchString: '',
  },
  action,
) {
  switch (action.type) {
    case TOGGLE_SEARCH_EXPAND:
      return { ...state, isExpanded: !state.isExpanded };
    case FETCH_SEARCH_SUCCESS:
      return { ...state, searchResponse: action.response };
    case CHANGE_SEARCH:
      return { ...state, searchResponse: null, searchString: action.searchString };
    case FETCH_SEARCH_ERROR:
      return { ...state, searchResponse: action.error };
    case FETCH_HIERARCHY_NESTED_ITEMS:
      return { ...state };
    case FETCH_HIERARCHY_NESTED_ITEMS_SUCCESS: {
      const updatedHierarchy = nestOrgUnitInHierarchy(action.response, state.hierarchyData);
      return { ...state, hierarchyData: updatedHierarchy };
    }
    case FETCH_HIERARCHY_NESTED_ITEMS_ERROR:
      return { ...state, hierarchyData: action.error };
    case CLOSE_DROPDOWN_OVERLAYS:
      return { ...state, isExpanded: false };
    default:
      return state;
  }
}

function measureBar(
  state = {
    isExpanded: false,
    selectedMeasureId: null,
    currentMeasure: {},
    measureHierarchy: {},
    currentMeasureOrganisationUnitCode: null,
    error: null,
  },
  action,
) {
  switch (action.type) {
    case CLEAR_MEASURE_HIERARCHY:
      return { ...state, measureHierarchy: {} };
    case CLEAR_MEASURE:
      return { ...state, currentMeasure: {}, selectedMeasureId: null };
    case CHANGE_MEASURE:
      return {
        ...state,
        hiddenMeasures: {},
        currentMeasure: getMeasureFromHierarchy(state.measureHierarchy, action.measureId) || {},
        selectedMeasureId: action.measureId,
        currentMeasureOrganisationUnitCode: action.organisationUnitCode,
      };
    case TOGGLE_MEASURE_EXPAND:
      return { ...state, isExpanded: !state.isExpanded };
    case FETCH_MEASURES_SUCCESS:
      return {
        ...state,
        measureHierarchy: action.response.measures,
        // If a new set of measures has come through, refresh the currentMeasure using the currently
        // selected measure id.
        currentMeasure:
          getMeasureFromHierarchy(action.response.measures, state.selectedMeasureId) || {},
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
    overlay: !isMobile() && LANDING,
    currentOrganisationUnit: {},
    currentOrganisationUnitSiblings: [],
    highlightedOrganisationUnit: {},
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
      };
    case SHOW_TUPAIA_INFO:
      return {
        ...state,
        isSidePanelExpanded: true,
      };
    case CHANGE_ORG_UNIT:
      return {
        ...state,
        isLoadingOrganisationUnit: true,
      };
    case CHANGE_ORG_UNIT_SUCCESS:
      return {
        ...state,
        isLoadingOrganisationUnit: false,
        currentOrganisationUnit: action.organisationUnit,
        currentOrganisationUnitSiblings: action.organisationUnitSiblings,
        highlightedOrganisationUnit: {},
      };
    case HIGHLIGHT_ORG_UNIT:
      return {
        ...state,
        highlightedOrganisationUnit: action.organisationUnit,
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
    default:
      return state;
  }
}

function chartExport(
  state = {
    isVisible: false,
    isLoading: false,
    isComplete: false,
    errorMessage: '',
    formats: ['png', 'pdf'],
    organisationUnitCode: '',
    organisationUnitName: '',
    viewId: '',
    dashboardGroupId: '',
    chartType: '',
    startDate: null,
    endDate: null,
    extraConfig: {},
    selectedFormat: 'png',
  },
  action,
) {
  switch (action.type) {
    case ATTEMPT_CHART_EXPORT:
      return {
        ...state,
        isLoading: true,
        errorMessage: '',
      };

    case FETCH_CHART_EXPORT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isComplete: true,
      };

    case FETCH_CHART_EXPORT_ERROR:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.errorMessage,
      };

    case OPEN_EXPORT_DIALOG:
      return {
        ...state,
        isVisible: true,
        isLoading: false,
        isComplete: false,
        organisationUnitCode: action.organisationUnitCode,
        organisationUnitName: action.organisationUnitName,
        viewId: action.viewId,
        dashboardGroupId: action.dashboardGroupId,
        startDate: action.startDate,
        endDate: action.endDate,
        formats: action.formats,
        selectedFormat: action.formats[0],
        chartType: action.chartType,
        extraConfig: action.extraConfig,
      };

    case CLOSE_EXPORT_DIALOG:
      return {
        ...state,
        isVisible: false,
        isComplete: false,
        errorMessage: '',
      };

    case SELECT_CHART_EXPORT_FORMAT:
      return {
        ...state,
        selectedFormat: action.format,
      };

    default:
      return state;
  }
}

function enlargedDialog(
  state = {
    isVisible: false,
    isLoading: false,
    viewContent: { type: '', data: [] },
    infoViewKey: '',
    organisationUnitName: '',
    errorMessage: '',
    startDate: null,
    endDate: null,
  },
  action,
) {
  switch (action.type) {
    case OPEN_ENLARGED_DIALOG:
      return {
        ...state,
        isVisible: true,
        isLoading: false,
        viewContent: action.viewContent,
        infoViewKey: action.infoViewKey,
        organisationUnitName: action.organisationUnitName,
        errorMessage: '',
        startDate: null,
        endDate: null,
      };

    case CLOSE_ENLARGED_DIALOG:
      return {
        ...state,
        isVisible: false,
        viewContent: {},
        infoViewKey: '',
        organisationUnitName: '',
      };

    case SET_ENLARGED_DIALOG_DATE_RANGE:
      return {
        ...state,
        startDate: action.startDate,
        endDate: action.endDate,
        isLoading: true,
      };

    case UPDATE_ENLARGED_DIALOG:
      return {
        ...state,
        viewContent: action.viewContent,
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

function drillDown(
  state = {
    isVisible: false,
    isLoading: false,
    errorMessage: '',
    currentLevel: 0,
    levelContents: {},
  },
  action,
) {
  switch (action.type) {
    case ATTEMPT_DRILL_DOWN:
      return {
        ...state,
        isLoading: true,
        isVisible: true,
        errorMessage: '',
        currentLevel: action.drillDownLevel,
      };

    case FETCH_DRILL_DOWN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        levelContents: { ...state.levelContents, [action.drillDownLevel]: action.viewContent },
      };

    case FETCH_DRILL_DOWN_ERROR:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.errorMessage,
      };

    case GO_TO_DRILL_DOWN_LEVEL:
      return {
        ...state,
        errorMessage: '',
        isLoading: false,
        currentLevel: action.drillDownLevel,
      };

    case CLOSE_ENLARGED_DIALOG:
    case CLOSE_DRILL_DOWN:
      return {
        ...state,
        isVisible: false,
      };

    default:
      return state;
  }
}

/**
 * Stores the orgUnit at the appropriate location in currentHierarchy, returning the
 * resulting hierarchy.
 *
 * @param {object} orgUnit The organisationUnit to be nestedItems
 * @param {array} currentHierarchy The current hierarchy to modify
 *
 * @return {array} The new hierarchy array with added orgUnit data
 */
function nestOrgUnitInHierarchy(orgUnit, currentHierarchy) {
  if (
    !currentHierarchy ||
    !Array.isArray(currentHierarchy) ||
    currentHierarchy.length < 1 ||
    orgUnit.organisationUnitCode === 'World'
  ) {
    return orgUnit.organisationUnitChildren;
  }

  const recursiveReplace = branch => {
    branch.some((child, index, branchArray) => {
      if (child.organisationUnitCode === orgUnit.organisationUnitCode) {
        branchArray[index] = orgUnit; // eslint-disable-line no-param-reassign
        // Org unit replaced, return true and cascade up the recursive branch.some() calls
        return true;
      }
      if (Array.isArray(child.organisationUnitChildren)) {
        return recursiveReplace(child.organisationUnitChildren);
      }
      return false; // Did not find the orgUnit to replace and are at a leaf node.
    });
  };
  const updatedHierarchy = [...currentHierarchy];
  recursiveReplace(updatedHierarchy);
  return updatedHierarchy;
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
          viewId: view.viewId,
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
  chartExport,
  enlargedDialog,
  drillDown,
  disaster,
  project,
  orgUnits,
});
