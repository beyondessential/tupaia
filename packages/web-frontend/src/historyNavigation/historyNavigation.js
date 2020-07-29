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
  SEARCH_PARAM_KEY_MAP,
} from './constants';

import { translateLocationToInternal, decodeUrl, createUrl, replaceKeysAndRemoveNull, isLocationEqual } from './utils';

// Functions dealing with history directly
const history = createBrowserHistory();

// Capture on app init.
const initialLocation = history.location;

export const getInitialLocation = () => translateLocationToInternal(initialLocation);

export const getRawCurrentLocation = () => history.location;

export const getInitialtUrlComponents = () => {
  const { pathname, search } = getInitialLocation();
  return decodeUrl(pathname, search);
};

export function pushHistory(pathname, searchParams = {}) {
  const location = getRawCurrentLocation();

  const search = queryString.stringify(
    replaceKeysAndRemoveNull(searchParams, SEARCH_PARAM_KEY_MAP),
  );

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

/**
 * Returns a string representing the url given certain parameters
 * @param {String} params An object containing the parameters to set in the url
 */
export function createUrlString(params) {
  return null; // TODO: This function currently doesn't work
  const location = createUrl(params);
  const query = queryString.stringify(location.search);
  return `${location.pathname}?${query}`;
}

/**
 * Returns a new location with a component of the url set to the specified value
 * @param {String} component A member of URL_COMPONENTS
 * @param {*} value The value to set it to
 * @param {Object} baseLocation The existing url
 */
export const setUrlComponent = (component, value, baseLocation) => {
  const previousComponents = decodeUrl(baseLocation.pathname, baseLocation.search);

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

/**
 * Returns a location which represents the root.
 */
export const clearUrl = () => {
  return { pathname: '/', search: {} };
};

/**
 * Gets a component of the url
 * @param {string} component A member of URL_COMPONENTS
 * @param {object} location An object with a pathname and search component
 */
export const getUrlComponent = (component, location) => {
  const components = decodeUrl(location.pathname, location.search);
  const value = components[component];
  return value === '' ? undefined : value;
};