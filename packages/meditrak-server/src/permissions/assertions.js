/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from './constants';

const DEFAULT_ERROR_MESSAGE = 'Your permissions do not allow access to the requested resource';

////
// utilities for running multiple permissions assertions
////

/**
 * Returns true all the time. This is for any route handlers that do not need permissions.
 */
export const allowNoPermissions = () => {
  return true;
};

/**
 * Returns true if all of the permissions assertions pass, or throws an error
 * @param {function[]} assertions  Each permissions assertion should return true or throw an error
 * @param {string} errorMessage
 */
export const assertAllPermissions = (
  assertions,
  errorMessage = DEFAULT_ERROR_MESSAGE,
) => async accessPolicy => {
  try {
    for (let i = 0; i < assertions.length; i++) {
      const assertion = assertions[i];
      await assertion(accessPolicy);
    }
  } catch (e) {
    throw new Error(errorMessage);
  }
};

/**
 * Returns true if any of the permissions assertions pass, or throws an error
 * @param {function[]} assertions  Each permissions assertion should return true or throw an error
 * @param {string} errorMessage
 */
export const assertAnyPermissions = (
  assertions,
  errorMessage = DEFAULT_ERROR_MESSAGE,
) => async accessPolicy => {
  for (let i = 0; i < assertions.length; i++) {
    try {
      const assertion = assertions[i];
      await assertion(accessPolicy);
      return true;
    } catch (e) {
      // swallow specific errors, in case any assertion returns true
    }
  }
  throw new Error(errorMessage);
};

////
// specific permissions assertions
////
const checkOrThrow = checker => accessPolicy => {
  const hasPermission = checker(accessPolicy);
  if (!hasPermission) {
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }
  return true;
};
export const assertBESAdminAccess = checkOrThrow(accessPolicy =>
  accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP),
);
export const assertTupaiaAdminPanelAccess = checkOrThrow(accessPolicy =>
  accessPolicy.allowsSome(null, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP),
);
