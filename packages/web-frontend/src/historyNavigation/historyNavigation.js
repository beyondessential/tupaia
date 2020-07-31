/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import { createBrowserHistory } from 'history';
import { URL_COMPONENTS } from './constants';

import {
  decodeUrl,
  createUrl,
  translateSearchToInternal,
  translateSearchToExternal,
  isLocationEqual,
} from './utils';

// Functions dealing with history directly
const history = createBrowserHistory();

// Capture on app init.
const initialLocation = history.location;

export const getInitialLocation = () => ({
  pathname: initialLocation.pathname,
  search: translateSearchToInternal(initialLocation.search),
});

const getRawCurrentLocation = () => history.location;

export const getInitialUrlComponents = () => {
  const { pathname, search } = getInitialLocation();
  return decodeUrl(pathname, search);
};

export function attemptPushHistory(pathname, searchParams = {}) {
  const location = getRawCurrentLocation();

  const search = translateSearchToExternal(searchParams);

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
  const { pathname, search } = createUrl(params);
  const query = translateSearchToExternal(search);
  return `${pathname}?${query}`;
}

/**
 * Returns a new location with a component of the url set to the specified value
 * @param {String} component A member of URL_COMPONENTS
 * @param {String} value The value to set it to
 * @param {Object} baseLocation The existing location
 */
export const setUrlComponent = (component, value, baseLocation) => {
  const previousComponents = decodeUrl(baseLocation.pathname, baseLocation.search);

  const params = {};
  Object.values(URL_COMPONENTS).forEach(param => {
    params[param] = param === component ? value : previousComponents[param];
  });

  return createUrl(params);
};

/**
 * Returns a location which represents the root.
 */
export const clearUrl = () => {
  return createUrl({});
};

/**
 * Gets a component of the url
 * @param {String} component A member of URL_COMPONENTS
 * @param {object} location An object with a pathname and search component
 */
export const getUrlComponent = (component, location) => {
  const components = decodeUrl(location.pathname, location.search);
  const value = components[component];
  return value === '' ? undefined : value;
};
