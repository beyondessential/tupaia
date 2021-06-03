/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/**
 *
 * @param {AccessPolicyObject} accessPolicy
 * @returns {boolean}
 */
export const isLegacyAccessPolicy = accessPolicy => {
  if (accessPolicy === null || typeof accessPolicy !== 'object') {
    throw new Error(`Invalid AccessPolicyObject type! Expected object, got: ${accessPolicy}`);
  }
  return accessPolicy.hasOwnProperty('permissions');
};
