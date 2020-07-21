/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import queryString from 'query-string';
import { createBrowserHistory } from 'history';
import {
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
    // TODO: userpage stuff
    return { pathname: userPage };
  }

  const urlComponents = PATH_COMPONENTS.map(component => pathParams[component]);

  // remove falsey last elements
  // e.g. [null, 'hi', 'hey', undefined, ''] => [null, 'hi', 'hey']
  while (urlComponents.length > 0 && !urlComponents[urlComponents.length - 1]) {
    urlComponents.pop();
  }

  const pathname = `/${urlComponents.join('/')}`;

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
  // Search
  const searchParams = replaceKeysAndRemoveNull(
    queryString.parse(search),
    swapKeyAndVal(SEARCH_PARAM_KEY_MAP),
  );

  // Path
  const cleanPathname = pathname[0] === '/' ? pathname.slice(1) : pathname;

  if (cleanPathname === '') {
    return { projectSelector: true, ...searchParams };
  }

  const pathParams = {};
  const [prefixOrProject, ...restOfPath] = cleanPathname.split('/');
  const [, ...restOfComponents] = PATH_COMPONENTS;

  restOfPath.forEach((value, i) => {
    pathParams[restOfComponents[i]] = value;
  });

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

export const getCurrentUrlComponents = () => {
  const location = getCurrentLocation();
  return decodeUrl(location.pathname, location.search);
};

/**
 * Sets a component of the url to the specified value
 * @param {String} component A member of URL_COMPONENTS
 * @param {*} value The value to set it to
 */
export const setUrlComponent = (component, value, initialLocation) => {
  const location = initialLocation;
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
  return { pathname, search };
};

export const clearUrl = () => {
  return { pathname: '/', search: '' };
};

/**
 * Sets a component of the url to the specified value
 * @param {string} component A member of URL_COMPONENTS
 * @param {object} location An object with a pathname and search component (// TODO: maybe should be a string? Also new name)
 * @param {*} value The value to set it to
 */
export const getUrlComponent = (component, location) => {
  const components = decodeUrl(location.pathname, location.search);
  const value = components[component];
  return value === '' ? undefined : value;
};

const replaceKeysAndRemoveNull = (obj, mapping) => {
  const newObj = {}; // TODO: Write better (shouldn't need these funcs I don't think)
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null && val !== undefined) newObj[mapping[key]] = val;
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
