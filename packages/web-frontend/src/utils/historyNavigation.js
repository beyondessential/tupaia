/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History navigation.
 *
 * Url writing and interpreting for Tupaia. Urls are in the format
 *
 * /[project_code]/[entity_code]?m={measureId}&p={overlayPageName}
 *
 * eg
 * /PROJECT_CODE/ENTITY_CODE?m=124 - Load the given entity with measure 124 active.
 * /?p=about - Loads the home page with about overlay shown.
 */

import { createBrowserHistory } from 'history';
import queryString from 'query-string';

import {
  DIALOG_PAGE_RESET_PASSWORD,
  changeOrgUnit,
  changeMeasure,
  changeDashboardGroup,
  setOverlayComponent,
  openMapPopup,
  setPasswordResetToken,
  setVerifyEmailToken,
  openUserPage,
  findLoggedIn,
} from '../actions';

import { gaPageView } from '.';
import { selectProject } from '../projects/actions';
import { selectCurrentMeasure } from '../selectors';

const DEFAULT_PROJECT = 'explore';
const PASSWORD_RESET_PREFIX = 'reset-password';
const VERIFY_EMAIL = 'verify-email';

const DEFAULT_DASHBOARDS = {
  [DEFAULT_PROJECT]: 'General',
  disaster: 'Disaster Response',
};

const history = createBrowserHistory();

export function decodeUrl(pathname, search) {
  if (pathname[0] === '/') {
    // ignore starting slash if one is provided
    return decodeUrl(pathname.slice(1), search);
  }

  const [
    prefix,
    organisationUnitCode = 'explore',
    dashboardId = null,
    reportId = null,
  ] = pathname.split('/');

  const {
    m: measureId,
    passwordResetToken,
    timeZone,
    startDate,
    endDate,
    disasterStartDate,
    disasterEndDate,
    verifyEmailToken,
    organisationUnitName,
  } = queryString.parse(search);
  switch (prefix) {
    case PASSWORD_RESET_PREFIX:
      return { userPage: prefix, passwordResetToken };
    case VERIFY_EMAIL:
      return { userPage: prefix, verifyEmailToken };
    default:
      return {
        organisationUnitCode,
        organisationUnitName,
        dashboardId,
        reportId,
        measureId,
        projectCode: prefix || DEFAULT_PROJECT,
        timeZone,
        startDate,
        endDate,
        disasterStartDate,
        disasterEndDate,
      };
  }
}

export function createUrlForAppState(state) {
  const dashboardId = state.dashboard.currentDashboardKey;
  const measureId = selectCurrentMeasure(state).measureId;

  const { currentOrganisationUnitCode } = state.global;
  const reportId = state.enlargedDialog.viewContent.viewId;
  const userPage = '';

  return createUrl({
    dashboardId,
    measureId,
    organisationUnitCode: currentOrganisationUnitCode,
    reportId,
    userPage,
    projectCode: state.project.activeProjectCode,
  });
}

function getDefaultDashboardForProject(projectCode) {
  return DEFAULT_DASHBOARDS[projectCode] || DEFAULT_DASHBOARDS[DEFAULT_PROJECT];
}

export function createUrl({
  userPage,
  dashboardId,
  measureId,
  organisationUnitCode,
  organisationUnitName,
  projectCode = DEFAULT_PROJECT,
  reportId,
  timeZone,
  startDate,
  endDate,
  disasterStartDate,
  disasterEndDate,
}) {
  if (userPage) {
    return { pathname: userPage };
  }

  const search = {
    m: measureId,
    timeZone,
    startDate,
    endDate,
    disasterStartDate,
    disasterEndDate,
    organisationUnitName,
  };

  const defaultDashboard = getDefaultDashboardForProject(projectCode);

  const defaultUrlComponents = [DEFAULT_PROJECT, 'explore', defaultDashboard, null];

  const urlComponents = [
    projectCode,
    organisationUnitCode || 'explore',
    dashboardId || defaultDashboard,
    reportId,
  ];

  // use a double-equal as we actually do want to do a casting comparison
  // (the more verbose alternative would be to render everything to strings first)
  // eslint-disable-next-line eqeqeq
  const lastElementsAreEqual = (a, b) => a[a.length - 1] == b[b.length - 1];

  // Only show enough of the url to represent any difference from the default
  while (
    urlComponents.length &&
    defaultUrlComponents.length &&
    lastElementsAreEqual(urlComponents, defaultUrlComponents)
  ) {
    urlComponents.pop();
    defaultUrlComponents.pop();
  }

  const pathname = urlComponents.join('/');

  return { pathname, search };
}

export function createUrlString(params) {
  const location = createUrl(params);
  const query = queryString.stringify(location.search);
  return `${location.pathname}?${query}`;
}

function reactToHistory(location, store) {
  const {
    userPage,
    passwordResetToken,
    verifyEmailToken,
    organisationUnitCode,
    dashboardId,
    measureId,
    projectCode,
  } = decodeUrl(location.pathname, location.search);

  const state = store.getState();
  const { dispatch: rawDispatch } = store;
  const dispatch = action => rawDispatch({ ...action, meta: { preventHistoryUpdate: true } });

  if (userPage) {
    switch (userPage) {
      case PASSWORD_RESET_PREFIX:
        dispatch(setPasswordResetToken(passwordResetToken));
        dispatch(openUserPage(DIALOG_PAGE_RESET_PASSWORD));
        dispatch(changeOrgUnit()); // load world dashboard in background
        break;
      case VERIFY_EMAIL:
        dispatch(setVerifyEmailToken(verifyEmailToken));
        dispatch(changeOrgUnit()); // load world dashboard in background
        break;
      default:
        // we can only get here if this case was specifically added to decodeUrl
        console.error('Unhandled user page', userPage);
        break;
    }
    return;
  }

  dispatch(findLoggedIn());

  if (organisationUnitCode !== state.global.currentOrganisationUnitCode) {
    dispatch(changeOrgUnit(organisationUnitCode));
    dispatch(openMapPopup(organisationUnitCode));
  }

  if (measureId !== state.measureBar.selectedMeasureId) {
    dispatch(changeMeasure(measureId, organisationUnitCode));
  }

  if (dashboardId !== state.dashboard.currentDashboardKey) {
    dispatch(changeDashboardGroup(dashboardId));
  }

  if (projectCode !== state.project.activeProjectCode) {
    dispatch(selectProject(projectCode));
  }
}

// capture this on app init
const initialLocation = history.location;

export const getInitialLocation = () => initialLocation;

export function initHistoryDispatcher(store) {
  const { dispatch } = store;

  history.listen((location, action) => {
    // always catch url changes
    gaPageView(location.pathname);

    // We should only respond to POP (back/forward) events, as we can assume that PUSH/REPLACE
    // events were instigated by the application rather than the user, and responding to
    // application events should be happening inside sagas rather than here.
    if (action !== 'POP') return;

    reactToHistory(location, store);
  });

  if (initialLocation.pathname !== '/') {
    dispatch(setOverlayComponent(null));
  }

  reactToHistory(initialLocation, store, true);
}

function isLocationEqual(a, b) {
  const { measureId: prevMeasureId, ...prev } = decodeUrl(a.pathname, a.search);
  const { measureId: nextMeasureId, ...next } = decodeUrl(b.pathname, b.search);

  if (!Object.keys(prev).every(k => prev[k] === next[k])) {
    return false;
  }

  if (prevMeasureId && nextMeasureId && prevMeasureId !== nextMeasureId) {
    // only update history if measures are different, not when going from null to non-null
    return false;
  }

  return true;
}

function pushHistory(pathname, searchParams) {
  const { location } = history;

  const search = queryString.stringify(searchParams);

  const oldSearch = location.search.replace('?', ''); // remove the ? for comparisons

  // Prevent duplicate pushes.
  if (isLocationEqual(location, { pathname, search })) {
    if (pathname !== location.pathname || search !== oldSearch) {
      // We have a url that is functionally equivalent but different in string representation.
      // This could could be switching the prefix (project), so let's assume
      // that the updated version is "more correct" and update the history without a push.
      history.replace({ pathname, search });
    }
    return false;
  }

  history.push({
    pathname,
    search,
  });

  return true;
}

export const historyMiddleware = ({ getState }) => next => action => {
  const state = getState();
  const { pathname, search } = createUrlForAppState(state);

  if (!action.meta || !action.meta.preventHistoryUpdate) {
    pushHistory(`/${pathname}`, search);
  }

  return next(action);
};
