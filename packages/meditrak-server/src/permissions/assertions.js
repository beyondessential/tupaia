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
export const assertAllPermissions = (assertions, errorMessage) => async accessPolicy => {
  try {
    for (let i = 0; i < assertions.length; i++) {
      const assertion = assertions[i];
      await assertion(accessPolicy);
    }
  } catch (e) {
    throw new Error(errorMessage || e.message);
  }
};

/**
 * Returns true if any of the permissions assertions pass, or throws an error
 * @param {function[]} assertions  Each permissions assertion should return true or throw an error
 * @param {string} errorMessage
 */
export const assertAnyPermissions = (assertions, errorMessage) => async accessPolicy => {
  let combinedErrorMessages = `One of the following conditions need to be satisfied:\n`;

  for (let i = 0; i < assertions.length; i++) {
    try {
      const assertion = assertions[i];
      await assertion(accessPolicy);
      return true;
    } catch (e) {
      combinedErrorMessages += `${e.message}\n`;
      // swallow specific errors, in case any assertion returns true
    }
  }
  throw new Error(errorMessage || combinedErrorMessages);
};

////
// specific permissions assertions
////

export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP);

export const hasTupaiaAdminPanelAccess = accessPolicy =>
  accessPolicy.allowsSome(null, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);

export const assertBESAdminAccess = accessPolicy => {
  if (hasBESAdminAccess(accessPolicy)) {
    return true;
  }

  throw new Error(`Need ${BES_ADMIN_PERMISSION_GROUP} access`);
};
export const assertTupaiaAdminPanelAccess = accessPolicy => {
  if (hasTupaiaAdminPanelAccess(accessPolicy)) {
    return true;
  }

  throw new Error(`Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access`);
};
