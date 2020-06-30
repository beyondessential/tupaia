/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import queryString from 'query-string';
import { createBrowserHistory } from 'history';
import {
  getDefaultsForProject,
  DEFAULT_PROJECT,
  PATH_COMPONENTS,
  SEARCH_COMPONENTS,
  PASSWORD_RESET_PREFIX,
  SEARCH_PARAM_KEY_MAP,
  VERIFY_EMAIL_PREFIX,
} from './constants';

const history = createBrowserHistory();

const getCurrentLocation = () => history.location;

function createUrl(pathParams, searchParams) {
  const { userPage } = pathParams;
  if (userPage) {
    return { pathname: userPage };
  }

  const [defaultOrgUnit, defaultDashboard] = getDefaultsForProject(pathParams.PROJECT);
  const defaultUrlComponents = [DEFAULT_PROJECT, defaultOrgUnit, defaultDashboard];

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

  return { pathname, search: replaceKeysAndRemoveNull(searchParams, SEARCH_PARAM_KEY_MAP) };
}

export function createUrlString(params) {
  const location = createUrl(params);
  const query = queryString.stringify(location.search);
  return `${location.pathname}?${query}`;
}

function isLocationEqual(a, b) {
  return false; // TODO
  /*
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
    */
}

function pushHistory(pathname, searchParams) {
  const location = getCurrentLocation();

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

const decodeUrl = (pathname, search) => {
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

  const searchParams = replaceKeysAndRemoveNull(
    queryString.parse(search),
    swapKeyAndVal(SEARCH_PARAM_KEY_MAP),
  );

  if (!prefixOrProject) {
    return { ...pathParams, ...searchParams };
  }

  switch (prefixOrProject) {
    case PASSWORD_RESET_PREFIX:
      return {
        userPage: prefixOrProject,
        PASSWORD_RESET_TOKEN: searchParams.PASSWORD_RESET_TOKEN,
      };
    case VERIFY_EMAIL_PREFIX:
      return {
        userPage: prefixOrProject,
        VERIFY_EMAIL_TOKEN: searchParams.VERIFY_EMAIL_TOKEN,
      };
    default:
      return {
        PROJECT: prefixOrProject,
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
export const setUrlComponent = (component, value) => {
  const location = getCurrentLocation();
  const previousComponents = decodeUrl(location.pathname, location.search);

  const pathParams = {};
  PATH_COMPONENTS.forEach(param => {
    pathParams[param] = param === component ? value : previousComponents[param];
  });

  const searchParams = {};
  SEARCH_COMPONENTS.forEach(param => {
    searchParams[param] = param === component ? value : previousComponents[param];
  });

  const { pathname, search } = createUrl(pathParams, searchParams);

  const success = pushHistory(`/${pathname}`, search);
  console.log({
    success,
    searchParams,
    previousComponents,
    location,
    new: getCurrentLocation(),
    pathname,
    search,
  });
};

/**
 * Sets a component of the url to the specified value
 * @param {String} component A member of URL_COMPONENTS
 * @param {*} value The value to set it to
 */
export const getUrlComponent = component => {
  const location = getCurrentLocation();
  const components = decodeUrl(location.pathname, location.search);

  return components[component];
};

const replaceKeysAndRemoveNull = (obj, mapping) => {
  const newObj = {}; // TODO: Write better
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null && val !== undefined) newObj[mapping[key]] = val;
  });
  return newObj;
};

const swapKeyAndVal = obj => {
  const newObj = {}; // TODO: Write better
  Object.entries(obj).forEach(([key, val]) => {
    newObj[val] = key;
  });
  return newObj;
};
