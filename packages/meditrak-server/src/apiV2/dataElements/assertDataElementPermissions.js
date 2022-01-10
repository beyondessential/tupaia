/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess } from '../../permissions';

const getPermissionIdListWithWildcard = async (accessPolicy, models) => {
  // Get the users permission groups as a list of ids
  const userPermissionGroupNames = accessPolicy.getPermissionGroups();
  const userPermissionGroups = await models.permissionGroup.find({
    name: userPermissionGroupNames,
  });
  return ['*', ...userPermissionGroups.map(permission => permission.id)];
};

export const assertDataElementPermissions = async (accessPolicy, models, dataElementId) => {
  const dataElement = await models.dataElement.findById(dataElementId);
  if (!dataElement) {
    throw new Error(`No data element exists with id ${dataElementId}`);
  }
  const userPermissions = await getPermissionIdListWithWildcard(accessPolicy, models);
  if (dataElement.permission_groups.every(id => userPermissions.includes(id))) {
    return true;
  }
  throw new Error(
    'You require access to all of a data elements permission groups to perform this action',
  );
};

export const createDataElementDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };
  const userPermissions = await getPermissionIdListWithWildcard(accessPolicy, models);

  // Permission groups on the data element overlap with our permission groups
  // Wildcard is added to our list so it will be included
  dbConditions.permission_groups = {
    comparator: '&&', // Checks two array have any elements in common
    comparisonValue: userPermissions,
  };
  return dbConditions;
};
