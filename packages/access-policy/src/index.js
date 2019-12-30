/**
* Tupaia MediTrak
* Copyright (c) 2018 Beyond Essential Systems Pty Ltd
**/

export const READ_ACCESS_LEVEL = 1;
export const WRITE_ACCESS_LEVEL = 2;
export const READ_WRITE_ACCESS_LEVEL = READ_ACCESS_LEVEL | WRITE_ACCESS_LEVEL; // eslint-disable-line no-bitwise, max-len

/**
 * Check if the user has read/write access to an item. eg
 * hasAccess(accessPolicy, 'surveys', ['DL', 'DL_North'], 'Donor', 2); or hasAccess(accessPolicy, 'reports', ['DL']);
 *
 * @param {object} accessPolicy
 * @param {string} resource
 * @param {array} organisationUnitPath
 * @param {string} userGroup
 * @param {integer} readWriteLevel  Whether read, write, or both are required (1, 2, 3 respectively)
 *
 * @returns {boolean} Whether or not the user has permission to the resource with the appropriate
 *                    user group and read/write permissions
 */
export const hasAccess = (accessPolicy, resource, organisationUnitPath = [], userGroup = '', readWriteLevel = READ_ACCESS_LEVEL) => {
  const userGroups = getUserGroupAccessRights(accessPolicy, resource, organisationUnitPath);

  // If no user group is provided, detect whether any user group is available.
  if (!userGroup) {
    return Object.keys(userGroups).filter(userGroupName => userGroups[userGroupName]).length > 0;
  }
  const readWriteLevelGranted = userGroups[userGroup];
  return readWriteLevelGranted === READ_WRITE_ACCESS_LEVEL 
    || readWriteLevelGranted === readWriteLevel
    || readWriteLevelGranted === true     // legacy support -- old access policies just have true/false
    ;
};

/**
 * Check if the user has any nested access permissions for an item.
 *
 * Useful for in addition to hasAccess to allow limited access to parent nodes where
 * a child node may exist. Eg providing user access to view a limited list of facilities
 * in a country they do not have access to.
 *
 * @param {object} accessPolicy
 * @param {string} resource
 * @param {array} organisationUnitPath
 *
 * @returns {boolean} Whether or not the user has any nested permission groups for this path.
 */
export const hasNestedPermissions = (accessPolicy, resource, organisationUnitPath = []) => {
  const { permissions } = accessPolicy;
  const permission = permissions[resource];

  let treeItem = permission;

  for (let i = 0; i < organisationUnitPath.length; i++) {
    treeItem = treeItem._items[organisationUnitPath[i]];
  }

  return treeItem && treeItem._items && Object.values(treeItem._items).length > 0;
};

/**
 * Return access levels for a tree path within an access policy.
 *
 * @param {object} accessPolicy
 * @param {string} resource
 * @param {array} organisationUnitPath
 *
 * @returns {object} The tree path access eg:
 *  {
 *     Admin: false,
 *     Donor: true,
 *  }
 */
export const getUserGroupAccessRights = (accessPolicy, resource, organisationUnitPath = []) => {
  const userGroupAccessRights = {};

  // Get the permissions tree for the object the user is accessing.
  const { permissions } = accessPolicy;
  const permission = permissions[resource];

  let treeItem = permission;
  // Descend in to the deepest level of the access tree possible, checking the
  // users current access at each level and overwriting the current access grant.
  for (let i = 0; i < organisationUnitPath.length; i++) {
    treeItem = treeItem._items[organisationUnitPath[i]];

    if (!treeItem) {
      // Tree has reached a dead end, ignore access.
      break;
    }

    // Set the current access policy values, override
    // previous values if set.
    const treeItemAccess = treeItem._access;
    if (treeItemAccess) {
      Object.keys(treeItemAccess).forEach(pathUserGroup => {
        userGroupAccessRights[pathUserGroup] = treeItemAccess[pathUserGroup];
      });
    }

    if (!treeItem._items) {
      break;
    }
  }

  return userGroupAccessRights;
};

export const someChildHasAccess = (
  accessPolicy,
  resource, // Either 'reports' or 'surveys' (i.e. 'read' or 'write')
  organisationUnitPath = [],
  userGroup
) => {
  if (hasAccess(accessPolicy, resource, organisationUnitPath, userGroup)) {
    return true; // Found the user group permission at this child
  }

  const { permissions } = accessPolicy;
  const permissionsForResource = permissions[resource];

  // Traverse access policy until we get to the organisation unit at the end of the provided path
  let organisationUnitPolicy = permissionsForResource;
  for (let i = 0; i < organisationUnitPath.length; i++) {
    organisationUnitPolicy =
      organisationUnitPolicy._items &&
      organisationUnitPolicy._items[organisationUnitPath[i]];
    if (!organisationUnitPolicy) {
      // If the org unit at the end of the path is not specified in the policy, definitely no access
      return false;
    }
  }

  const { _items } = organisationUnitPolicy;
  if(!_items) return false;

  const childOrgUnitCodes = Object.keys(_items);
  return childOrgUnitCodes.some(code =>
    someChildHasAccess(accessPolicy, resource, [...organisationUnitPath, code], userGroup)
  );
};
