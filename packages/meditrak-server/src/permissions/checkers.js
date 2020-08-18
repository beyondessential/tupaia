/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from './constants';
import { checkEntitiesImportPermissions } from './imports';

const DEFAULT_ERROR_MESSAGE = 'Your permissions do not allow access to the requested resource';

////
// utilities for running multiple permissions checks
////

/**
 * Returns true all the time. This is for any route handlers that do not need permissions.
 */
export const checkNoPermissions = () => {
  return true;
};

/**
 * Returns true if all of the permissions checkers pass, or throws an error
 * @param {function[]} permissionsCheckers  Each permission checking function should return true or throw an error
 * @param {string} errorMessage
 */
export const checkAllPermissions = (
  permissionsCheckers,
  errorMessage = DEFAULT_ERROR_MESSAGE,
) => async accessPolicy => {
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
export const checkAnyPermissions = (
  permissionsCheckers,
  errorMessage = DEFAULT_ERROR_MESSAGE,
) => async accessPolicy => {
  for (let i = 0; i < permissionsCheckers.length; i++) {
    try {
      const permissionsChecker = permissionsCheckers[i];
      await permissionsChecker(accessPolicy);
      return true;
    } catch (e) {
      // swallow specific errors, in case any checker returns true
    }
  }
  throw new Error(errorMessage);
};

////
// specific permissions checkers
////
const checkOrThrow = checker => accessPolicy => {
  const hasPermission = checker(accessPolicy);
  if (!hasPermission) {
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }
  return true;
};
export const hasBESAdminAccess = checkOrThrow(accessPolicy =>
  accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP),
);
export const hasTupaiaAdminPanelAccess = checkOrThrow(accessPolicy =>
  accessPolicy.allowsSome(null, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP),
);
export const hasEntitiesImportPermissions = checkOrThrow(
  (accessPolicy, models, entitiesByCountryName) =>
    checkEntitiesImportPermissions(accessPolicy, models, entitiesByCountryName),
);
