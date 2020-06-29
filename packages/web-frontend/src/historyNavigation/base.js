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

import { SELECT_PROJECT, CHANGE_ORG_UNIT, CHANGE_DASHBOARD_GROUP } from '../actions';

import { gaPageView } from '../utils';

// Path components
const PROJECT = 'PROJECT';
const ORG_UNIT = 'ORG_UNIT';
const DASHBOARD = 'DASHBOARD';
const REPORT = 'REPORT';

// Search components
const MEASURE = 'MEASURE';
const PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN';
const TIMEZONE = 'TIMEZONE';
const START_DATE = 'START_DATE';
const END_DATE = 'END_DATE';
const DISASTER_START_DATE = 'DISASTER_START_DATE';
const DISASTER_END_DATE = 'DISASTER_END_DATE';
const VERIFY_EMAIL_TOKEN = 'VERIFY_EMAIL_TOKEN';

export const URL_COMPONENTS = {
  // Path components
  [PROJECT]: PROJECT,
  [ORG_UNIT]: ORG_UNIT,
  [DASHBOARD]: DASHBOARD,

  // Search components
  [MEASURE]: MEASURE,
  [REPORT]: REPORT,
  [PASSWORD_RESET_TOKEN]: PASSWORD_RESET_TOKEN,
  [TIMEZONE]: TIMEZONE,
  [START_DATE]: START_DATE,
  [END_DATE]: END_DATE,
  [DISASTER_START_DATE]: DISASTER_START_DATE,
  [DISASTER_END_DATE]: DISASTER_END_DATE,
  [VERIFY_EMAIL_TOKEN]: VERIFY_EMAIL_TOKEN,
};

export const PATH_COMPONENTS = [PROJECT, ORG_UNIT, DASHBOARD];

const PATH_PARAM_CONFIG = {
  project: {
    default: 'explore',
  },
  organisationUnitCode: {
    default: 'explore',
  },
  dashboardId: {
    default: 'General',
  },
};

const SEARCH_PARAM_KEY_MAP = {
  [MEASURE]: 'overlay',
  [REPORT]: 'report',
  [PASSWORD_RESET_TOKEN]: 'passwordResetToken',
  [TIMEZONE]: 'timeZone',
  [START_DATE]: 'startDate',
  [END_DATE]: 'endDate',
  [DISASTER_START_DATE]: 'disasterStartDate',
  [DISASTER_END_DATE]: 'disasterEndDate',
  [VERIFY_EMAIL_TOKEN]: 'verifyEmailToken',
};

const DEFAULT_PROJECT = 'explore';
const DEFAULT_ORG_UNIT = 'explore';
const PASSWORD_RESET_PREFIX = 'reset-password';
const VERIFY_EMAIL_PREFIX = 'verify-email';

const DEFAULT_DASHBOARDS = {
  [DEFAULT_PROJECT]: 'General',
  disaster: 'Disaster Response',
};

function getDefaultDashboardForProject(projectCode) {
  return DEFAULT_DASHBOARDS[projectCode] || DEFAULT_DASHBOARDS[DEFAULT_PROJECT];
}

const history = createBrowserHistory();

const initialLocation = history.location;

export const getInitialLocation = () => initialLocation;

const getCurrentLocation = () => history.location;

export function createUrl(pathParams, searchParams) {
  const { userPage } = pathParams;
  if (userPage) {
    return { pathname: userPage };
  }

  const defaultDashboard = getDefaultDashboardForProject(pathParams.PROJECT);

  const defaultUrlComponents = [DEFAULT_PROJECT, DEFAULT_ORG_UNIT, defaultDashboard];

  const urlComponents = Object.values(pathParams).map((val, i) => val || defaultUrlComponents[i]);

  // use a double-equal as we actually do want to do a casting comparison
  // (the more verbose alternative would be to render everything to strings first)
  // eslint-disable-next-line eqeqeq
  const lastElementsAreEqualOrFalsey = (a, b) =>
    // eslint-disable-next-line eqeqeq
    !a[a.length - 1] || !b[b.length - 1] || a[a.length - 1] == b[b.length - 1];

  // Only show enough of the url to represent any difference from the default
  while (
    urlComponents.length &&
    defaultUrlComponents.length &&
    lastElementsAreEqualOrFalsey(urlComponents, defaultUrlComponents)
  ) {
    console.log(urlComponents);
    urlComponents.pop();
    defaultUrlComponents.pop();
  }
  console.log(urlComponents);

  const pathname = urlComponents.join('/');

  return { pathname, search: searchParams };
}

export function createUrlString(params) {
  const location = createUrl(params);
  const query = queryString.stringify(location.search);
  return `${location.pathname}?${query}`;
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

export function pushHistory(pathname, searchParams) {
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

export const historyMiddleware = () => next => action => {
  switch (action.type) {
    // Actions that modify path
    case SELECT_PROJECT:
      console.log(action);
      setUrlComponent(URL_COMPONENTS.PROJECT, action.projectCode);
      break;
    case CHANGE_ORG_UNIT:
      console.log(action);
      setUrlComponent(URL_COMPONENTS.ORG_UNIT, action.organisationUnitCode);
      break;
    case CHANGE_DASHBOARD_GROUP:
      console.log(action);
      setUrlComponent(URL_COMPONENTS.DASHBOARD, action.name);
      break;

    // Actions that modify search params
    default:
      console.log('No URL change required');
  }

  return next(action);
};

export const decodeUrl = (pathname, search) => {
  if (pathname[0] === '/') {
    // ignore starting slash if one is provided
    return decodeUrl(pathname.slice(1), search);
  }
  const pathParams = {};
  const [prefixOrProject, ...restOfPath] = pathname.split('/');
  const [, ...restOfComponents] = PATH_COMPONENTS;

  restOfPath.forEach((value, i) => {
    pathParams[restOfComponents[i]] = value;
  });

  const searchParams = replaceKeys(queryString.parse(search), swapKeyAndVal(SEARCH_PARAM_KEY_MAP));

  switch (prefixOrProject) {
    case PASSWORD_RESET_PREFIX:
      return {
        userPage: prefixOrProject,
        [PASSWORD_RESET_TOKEN]: searchParams.PASSWORD_RESET_TOKEN,
      };
    case VERIFY_EMAIL_PREFIX:
      return { userPage: prefixOrProject, [VERIFY_EMAIL_TOKEN]: searchParams.VERIFY_EMAIL_TOKEN };
    default:
      return {
        [PROJECT]: prefixOrProject || DEFAULT_PROJECT,
        ...pathParams,
        ...searchParams,
      };
  }
};

/**
 * Sets a component of the url to the specified value
 * @param {String} component A member of URL_COMPONENTS
 * @param {*} value The value to set it to
 */
const setUrlComponent = (component, value) => {
  const location = getCurrentLocation();
  const previousComponents = decodeUrl(location.pathname, location.search);

  const pathParams = {};
  PATH_COMPONENTS.forEach(param => {
    pathParams[param] = param === component ? value : previousComponents[param];
  });

  const searchParams = {};
  console.log(pathParams);

  const { pathname, search } = createUrl({ ...pathParams, ...searchParams });

  const success = pushHistory(`/${pathname}`, search);
  console.log({
    success,
    previousComponents,
    location,
    new: getCurrentLocation(),
    pathname,
    search,
  });
};

const replaceKeys = (obj, mapping) => {
  const newObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    newObj[mapping[key]] = val;
  });
  return newObj;
};

const swapKeyAndVal = obj => {
  const newObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    newObj[val] = key;
  });
  return newObj;
};
