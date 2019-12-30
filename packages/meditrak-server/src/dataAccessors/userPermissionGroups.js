/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import { DatabaseError, UnauthenticatedError } from '../errors';

export const getUserPermissionGroups = async (models, userId, countryIdentifierKey) => {
  // Get the permission group ids for each country the user has access to
  let userCountryPermissionGroups;
  const permissionGroups = {};

  try {
    userCountryPermissionGroups = await models.userCountryPermission.find({ user_id: userId });
    const childPermissionGroupCache = {};
    const countryNameCache = {};
    await Promise.all(
      userCountryPermissionGroups.map(async userCountryPermissionGroup => {
        const countryId = userCountryPermissionGroup.country_id;
        let countryIdentifier =
          countryIdentifierKey === 'id' ? countryId : countryNameCache[countryId];
        if (countryIdentifier === undefined) {
          const country = await models.country.findById(countryId);
          countryIdentifier = country.name;
          countryNameCache[countryId] = country.name;
        }
        const permissionGroup = await userCountryPermissionGroup.permissionGroup();

        let childPermissionGroupIds = childPermissionGroupCache[permissionGroup.id];
        if (childPermissionGroupIds === undefined) {
          const permissionGroupChildren = await permissionGroup.getChildTree();
          childPermissionGroupCache[permissionGroup.id] = permissionGroupChildren.map(
            permissionGroupChild => permissionGroupChild.id,
          );
          childPermissionGroupIds = childPermissionGroupCache[permissionGroup.id];
        }
        const existingPermissionGroups = permissionGroups[countryIdentifier] || [];
        permissionGroups[countryIdentifier] = [
          ...existingPermissionGroups, // Any permission groups already recorded for country
          permissionGroup.id, // Plus the current parent permission group
          ...childPermissionGroupIds, // Plus all the children of this permission group
        ];
      }),
    );
  } catch (error) {
    throw new DatabaseError('finding user permission groups', error);
  }
  if (!userCountryPermissionGroups || userCountryPermissionGroups.length === 0) {
    throw new UnauthenticatedError('User does not have permission to log in to any countries');
  }

  return permissionGroups;
};
