import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from './constants';

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

  for (const assertion of assertions) {
    try {
      await assertion(accessPolicy);
      return true;
    } catch (e) {
      combinedErrorMessages += `${e.message}\n`;
      // swallow specific errors, in case any assertion returns true
    }
  }
  throw new Error(errorMessage || combinedErrorMessages);
};

/**
 * specific permissions assertions
 */
export const hasBESAdminAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);

export const hasVizBuilderAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, VIZ_BUILDER_PERMISSION_GROUP);

export const hasPermissionGroupAccess = (accessPolicy, permissionGroup) =>
  accessPolicy.allowsSome(undefined, permissionGroup);

// has access to all permission groups inputted
export const hasPermissionGroupsAccess = (accessPolicy, permissionGroups) => {
  for (let i = 0; i < permissionGroups.length; i++) {
    if (!accessPolicy.allowsSome(undefined, permissionGroups[i])) {
      return false;
    }
  }
  return true;
};

export const hasSomePermissionGroupsAccess = (accessPolicy, permissionGroups) => {
  for (let i = 0; i < permissionGroups.length; i++) {
    if (accessPolicy.allowsSome(undefined, permissionGroups[i])) {
      return true;
    }
  }

  return false;
};

export const assertBESAdminAccess = accessPolicy => {
  if (hasBESAdminAccess(accessPolicy)) {
    return true;
  }

  throw new Error(`Need ${BES_ADMIN_PERMISSION_GROUP} access`);
};

export const assertVizBuilderAccess = accessPolicy => {
  if (hasVizBuilderAccess(accessPolicy)) {
    return true;
  }

  throw new Error(`Need ${VIZ_BUILDER_PERMISSION_GROUP} access`);
};

export const hasTupaiaAdminPanelAccess = accessPolicy =>
  accessPolicy.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);

export const hasTupaiaAdminPanelAccessToCountry = (accessPolicy, countryCode) =>
  accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);

export const assertAdminPanelAccessToCountry = async (accessPolicy, models, recordId) => {
  const entity = await models.entity.findById(recordId);
  if (!entity) throw new Error(`No entity found with id ${recordId}`);

  const userHasAdminAccessToCountry = accessPolicy.allows(
    entity.country_code,
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  if (!userHasAdminAccessToCountry) {
    throw new Error(
      `Need Tupaia Admin Panel access to country '${entity.country_code}' to edit entity`,
    );
  }
  return true;
};

export const assertAdminPanelAccess = accessPolicy => {
  if (hasTupaiaAdminPanelAccess(accessPolicy)) {
    return true;
  }

  throw new Error(`Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access`);
};

export const assertPermissionGroupAccess = (accessPolicy, permissionGroupName) => {
  if (hasPermissionGroupAccess(accessPolicy, permissionGroupName)) {
    return true;
  }

  throw new Error(`Need ${permissionGroupName} access`);
};

export const assertPermissionGroupsAccess = (accessPolicy, permissionGroupNames) => {
  if (
    hasPermissionGroupsAccess(accessPolicy, permissionGroupNames) ||
    hasBESAdminAccess(accessPolicy)
  ) {
    return true;
  }

  throw new Error(`You do not have access to all related permission groups`);
};
