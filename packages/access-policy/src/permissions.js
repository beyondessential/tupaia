import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';

/**
 * @typedef {import('./AccessPolicy').AccessPolicy} AccessPolicy
 * @typedef {(accessPolicy: AccessPolicy) => true} PermissionsAssertion
 * @typedef {(accessPolicy: AccessPolicy) => boolean} PermissionsChecker
 * @typedef {string} PermissionGroupName
 */

/**
 * Returns true all the time. This is for any route handlers that do not need permissions.
 * @type {PermissionsChecker}
 */
export const allowNoPermissions = () => true;

/**
 * Returns true if all of the permissions assertions pass, or throws an error
 * @param {function[]} assertions Each permissions assertion should return `true` or throw a
 * {@link PermissionsError}
 * @param {string} errorMessage
 */
export const assertAllPermissions = (assertions, errorMessage) => async accessPolicy => {
  try {
    for (const assertion of assertions) await assertion(accessPolicy);
    return true;
  } catch (e) {
    throw new PermissionsError(errorMessage || e.message);
  }
};

/**
 * Returns true if any of the permissions assertions pass, or throws an error
 * @param {function[]} assertions Each permissions assertion should return true or throw a
 * {@link PermissionsError}
 * @param {string} errorMessage
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
  throw new PermissionsError(errorMessage || combinedErrorMessages.join('\n'));
};

/** @type {PermissionsChecker} */
export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);

/** @type {PermissionsChecker} */
export const hasVizBuilderAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, VIZ_BUILDER_PERMISSION_GROUP);

/**
 * @type {PermissionsChecker}
 * @param {PermissionGroupName}
 */
export const hasPermissionGroupAccess = (accessPolicy, permissionGroup) =>
  accessPolicy.allowsSome(undefined, permissionGroup);

/**
 * Has access to all permission groups inputted
 * @type {PermissionsChecker}
 * @param {PermissionGroupName[]}
 */
export const hasPermissionGroupsAccess = (accessPolicy, permissionGroups) =>
  permissionGroups.every(pg => accessPolicy.allowsSome(undefined, pg));

/** @type {PermissionsChecker} */
export const hasSomePermissionGroupsAccess = (accessPolicy, permissionGroups) =>
  permissionGroups.some(pg => accessPolicy.allowsSome(undefined, pg));

/** @type {PermissionsAssertion} */
export const assertBESAdminAccess = accessPolicy => {
  if (hasBESAdminAccess(accessPolicy)) return true;
  throw new PermissionsError(`Need ${BES_ADMIN_PERMISSION_GROUP} access`);
};

/** @type {PermissionsAssertion} */
export const assertVizBuilderAccess = accessPolicy => {
  if (hasVizBuilderAccess(accessPolicy)) return true;
  throw new PermissionsError(`Need ${VIZ_BUILDER_PERMISSION_GROUP} access`);
};

/** @type {PermissionsChecker} */
export const hasTupaiaAdminPanelAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);

/** @type {PermissionsChecker} */
export const hasTupaiaAdminPanelAccessToCountry = (accessPolicy, countryCode) =>
  accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);

/**
 * @type {PermissionsAssertion}
 * @param {ModelRegistry} models
 * @param {string} recordId
 */
export const assertAdminPanelAccessToCountry = async (accessPolicy, models, recordId) => {
  const entity = ensure(
    await models.entity.findById(recordId),
    `No entity exists with ID ${recordId}`,
  );
  const userHasAdminAccessToCountry = accessPolicy.allows(
    entity.country_code,
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  if (!userHasAdminAccessToCountry) {
    throw new PermissionsError(
      `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to country ‘${entity.country_code}’ to edit entity ‘${entity.name}’`,
    );
  }
  return true;
};

/** @type {PermissionsAssertion} */
export const assertAdminPanelAccess = accessPolicy => {
  if (hasTupaiaAdminPanelAccess(accessPolicy)) return true;
  throw new PermissionsError(`Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access`);
};

/**
 * @type {PermissionsAssertion}
 * @param {PermissionGroupName} permissionGroupName
 */
export const assertPermissionGroupAccess = (accessPolicy, permissionGroupName) => {
  if (hasPermissionGroupAccess(accessPolicy, permissionGroupName)) return true;
  throw new PermissionsError(`Need ${permissionGroupName} access`);
};

/**
 * @type {PermissionsAssertion}
 * @param {PermissionGroupName[]} permissionGroupNames
 */
export const assertPermissionGroupsAccess = (accessPolicy, permissionGroupNames) => {
  if (
    hasPermissionGroupsAccess(accessPolicy, permissionGroupNames) ||
    hasBESAdminAccess(accessPolicy)
  ) {
    return true;
  }
  throw new PermissionsError(`You do not have access to all related permission groups`);
};
