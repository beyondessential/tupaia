/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createBrowserHistory } from 'history';

import { decodeLocation, createLocation, isLocationEqual } from './utils';

/* All code dealing with history directly */
const history = createBrowserHistory();

// Capture on app init.
const initialLocation = history.location;

const getCurrentLocation = () => history.location;

export function attemptPushHistory(newLocation) {
  const currentLocation = getCurrentLocation();

  if (isLocationEqual(currentLocation, newLocation)) {
    if (
      newLocation.pathname !== currentLocation.pathname ||
      newLocation.search !== currentLocation.search
    ) {
      // We have a url that is functionally equivalent but different in string representation.
      // Let's assume that the updated version is "more correct" and update the history without a push.
      history.replace(newLocation);
    }
    return false;
  }
  history.push(newLocation);

  return true;
}

export const addPopStateListener = callback => {
  history.listen((location, action) => {
    if (action === 'POP') callback(location);
  });
};
/* End of code dealing with history directly */

export const getInitialLocation = () => initialLocation;

export const getInitialLocationComponents = () => {
  return decodeLocation(getInitialLocation());
};

/**
 * Returns a new location with a component of the url set to the specified value
 * @param {Object} baseLocation The existing location
 * @param {Object} newComponents a new set of components of URL_COMPONENTS
 */

export const setLocationComponents = (baseLocation, newComponents) => {
  const previousComponents = decodeLocation(baseLocation);
  const params = { ...previousComponents, ...newComponents };

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
