/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createBrowserHistory } from 'history';

import {
  decodeLocation,
  createLocation,
  translateSearchToInternal,
  translateSearchToExternal,
  isLocationEqual,
} from './utils';

/* All code dealing with history directly */
const history = createBrowserHistory();

// Capture on app init.
const initialLocation = history.location;

const getRawCurrentLocation = () => history.location;

export function attemptPushHistory(pathname, searchParams = {}) {
  const location = getRawCurrentLocation();

  const search = translateSearchToExternal(searchParams);

  const oldSearch = location.search.replace('?', ''); // remove the ? for comparisons

  if (isLocationEqual(location, { pathname, search })) {
    if (pathname !== location.pathname || search !== oldSearch) {
      // We have a url that is functionally equivalent but different in string representation.
      // Let's assume that the updated version is "more correct" and update the history without a push.
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
/* End of code dealing with history directly */

export const getInitialLocation = () => ({
  pathname: initialLocation.pathname,
  search: translateSearchToInternal(initialLocation.search),
});

export const getInitialLocationComponents = () => {
  return decodeLocation(getInitialLocation());
};

/**
 * Returns a string representing the url given certain parameters
 * @param {String} params An object containing the parameters to set in the url
 */
export function createUrlString(params) {
  const { pathname, search } = createLocation(params);
  const query = translateSearchToExternal(search);
  return `${pathname}?${query}`;
}

/**
 * Returns a new location with a component of the url set to the specified value
 * @param {Object} baseLocation The existing location
 * @param {String} component A member of URL_COMPONENTS
 * @param {String} value The value to set it to
 */
export const setLocationComponent = (baseLocation, component, value) => {
  const previousComponents = decodeLocation(baseLocation);
  const params = { ...previousComponents, [component]: value };

  return createLocation(params);
};

/**
 * Returns a location which represents the root.
 */
export const clearLocation = () => {
  return createLocation({});
};

/**
 * Gets a component of the url
 * @param {object} location An object with a pathname and search component
 * @param {String} component A member of URL_COMPONENTS
 */
export const getLocationComponentValue = (location, component) => {
  const components = decodeLocation(location);
  const value = components[component];
  return value === '' ? undefined : value;
};
