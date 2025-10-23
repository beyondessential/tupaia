import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '@tupaia/constants';

/**
 * @typedef {import('./AccessPolicy').AccessPolicy} AccessPolicy
 * @typedef {(accessPolicy: AccessPolicy) => true} SimplePermissionsAssertion
 * @typedef {(accessPolicy: AccessPolicy) => boolean} SimplePermissionsChecker
 * @typedef {string} PermissionGroupName
 */

/**
 * Returns true all the time. This is for any route handlers that do not need permissions.
 * @returns {true}
 */
export const allowNoPermissions = () => true;

/**
 * Returns true if all of the permissions assertions pass, or throws an error
 * @param {function[]} assertions Each permissions assertion should return `true` or throw
 * @param {string} errorMessage
 * @returns {true}
 * @privateRemarks Ideally, these should throw `PermissionsError`s but adding @tupaia/utils as a
 * transitive dependency of @tupaia/meditrak-app causes MediTrak build to fail because it has
 * imports from node:fs.
 */
export const assertAllPermissions = (assertions, errorMessage) => async accessPolicy => {
  try {
    for (const assertion of assertions) await assertion(accessPolicy);
    return true;
  } catch (e) {
    throw new Error(errorMessage || e.message);
  }
};

/**
 * Returns `true` if any of the permissions assertions pass, otherwise throws
 * @param {function[]} assertions Each permissions assertion should return true or throw
 * @param {string} errorMessage
 * @returns {true}
 * @privateRemarks Ideally, these should throw `PermissionsError`s but adding @tupaia/utils as a
 * transitive dependency of @tupaia/meditrak-app causes MediTrak build to fail because it has
 * imports from node:fs.
 */
export const assertAnyPermissions = (assertions, errorMessage) => async accessPolicy => {
  const combinedErrorMessages = ['One of the following conditions need to be satisfied:'];

  for (const assertion of assertions) {
    try {
      await assertion(accessPolicy);
      return true;
    } catch (e) {
      combinedErrorMessages.push(e.message);
      // swallow specific errors, in case any assertion returns true
    }
  }
  throw new Error(errorMessage || combinedErrorMessages.join('\n'));
};

/** @type {SimplePermissionsChecker} */
export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);

/** @type {SimplePermissionsChecker} */
export const hasVizBuilderAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, VIZ_BUILDER_PERMISSION_GROUP);

/**
 * @param {AccessPolicy} accessPolicy
 * @param {PermissionGroupName} permissionGroup
 * @returns {boolean}
 */
export const hasPermissionGroupAccess = (accessPolicy, permissionGroup) =>
  accessPolicy.allowsSome(undefined, permissionGroup);

/**
 * Has access to all permission groups inputted
 * @param {AccessPolicy} accessPolicy
 * @param {PermissionGroupName[]} permissionGroups
 * @returns {boolean}
 */
export const hasPermissionGroupsAccess = (accessPolicy, permissionGroups) =>
  permissionGroups.every(pg => accessPolicy.allowsSome(undefined, pg));

/** @type {SimplePermissionsChecker} */
export const hasSomePermissionGroupsAccess = (accessPolicy, permissionGroups) =>
  permissionGroups.some(pg => accessPolicy.allowsSome(undefined, pg));

/** @type {SimplePermissionsAssertion} */
export const assertBESAdminAccess = accessPolicy => {
  if (hasBESAdminAccess(accessPolicy)) return true;
  throw new Error(`Need ${BES_ADMIN_PERMISSION_GROUP} access`);
};

/** @type {SimplePermissionsAssertion} */
export const assertVizBuilderAccess = accessPolicy => {
  if (hasVizBuilderAccess(accessPolicy)) return true;
  throw new Error(`Need ${VIZ_BUILDER_PERMISSION_GROUP} access`);
};

/** @type {SimplePermissionsChecker} */
export const hasTupaiaAdminPanelAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);

/**
 * @param {AccessPolicy} accessPolicy
 * @param {string} countryCode
 * @returns {boolean}
 */
export const hasTupaiaAdminPanelAccessToCountry = (accessPolicy, countryCode) =>
  accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);

/** @type {SimplePermissionsAssertion} */
export const assertAdminPanelAccess = accessPolicy => {
  if (hasTupaiaAdminPanelAccess(accessPolicy)) return true;
  throw new Error(`Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access`);
};

/**
 * @param {AccessPolicy} accessPolicy
 * @param {PermissionGroupName} permissionGroupName
 * @returns {true}
 */
export const assertPermissionGroupAccess = (accessPolicy, permissionGroupName) => {
  if (hasPermissionGroupAccess(accessPolicy, permissionGroupName)) return true;
  throw new Error(`Need ${permissionGroupName} access`);
};

/**
 * @param {AccessPolicy} accessPolicy
 * @param {PermissionGroupName[]} permissionGroupNames
 * @returns {true}
 */
export const assertPermissionGroupsAccess = (accessPolicy, permissionGroupNames) => {
  if (
    hasBESAdminAccess(accessPolicy) ||
    hasPermissionGroupsAccess(accessPolicy, permissionGroupNames)
  ) {
    return true;
  }
  throw new Error(`Need access to ${permissionGroupNames.join(', ')}`);
};
