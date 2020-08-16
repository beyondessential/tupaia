/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from './constants';

////
// utilities for running multiple permissions checks
////

/**
 * Returns true if all of the permissions checkers pass, or throws an error
 * @param {function[]} permissionsCheckers  Each permission checking function should return true or throw an error
 * @param {string} errorMessage
 */
export const checkAllPermissions = (permissionsCheckers, errorMessage) => async accessPolicy => {
  try {
    for (let i = 0; i < permissionsCheckers.length; i++) {
      const permissionsChecker = permissionsCheckers[i];
      await permissionsChecker(accessPolicy);
    }
  } catch (e) {
    throw new Error(errorMessage);
  }
};

/**
 * Returns true if any of the permissions checkers pass, or throws an error
 * @param {function[]} permissionsCheckers  Each permission checking function should return true or throw an error
 * @param {string} errorMessage
 */
export const checkAnyPermissions = (permissionsCheckers, errorMessage) => async accessPolicy => {
  try {
    for (let i = 0; i < permissionsCheckers.length; i++) {
      const permissionsChecker = permissionsCheckers[i];
      await permissionsChecker(accessPolicy);
      return true;
    }
  } catch (e) {
    // swallow specific errors, in case any checker returns true
  }
  throw new Error(errorMessage);
};

////
// specific permissions checkers
////
export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome([], BES_ADMIN_PERMISSION_GROUP);
export const hasTupaiaAdminPanelUserAccess = accessPolicy =>
  accessPolicy.allowsSome([], TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
