import { hasBESAdminAccess } from '../../permissions';
import { getPermissionListWithWildcard } from '../utilities';

export const assertDataElementGETPermissions = async (accessPolicy, models, dataElementId) => {
  // User requires access to any permission group
  if (await assertDataElementPermissions(accessPolicy, models, dataElementId, 'some')) {
    return true;
  }
  throw new Error('You do not have permission to view this data element');
};

export const assertDataElementEditPermissions = async (accessPolicy, models, dataElementId) => {
  // User requires access to all permission groups
  if (await assertDataElementPermissions(accessPolicy, models, dataElementId, 'every')) {
    return true;
  }
  throw new Error(
    'You require access to all of a data elements permission groups to perform this action',
  );
};

const assertDataElementPermissions = async (accessPolicy, models, dataElementId, test) => {
  const dataElement = await models.dataElement.findById(dataElementId);
  if (!dataElement) {
    throw new Error(`No data element exists with id ${dataElementId}`);
  }
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);
  // Test if user has access to any or all permission groups against the data element
  if (
    dataElement.permission_groups.length <= 0 ||
    dataElement.permission_groups[test](code => userPermissions.includes(code))
  ) {
    return true;
  }
  return false;
};

export const createDataElementDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);

  // Permission groups on the data element overlap with our permission groups
  // Wildcard is added to our list so it will be included
  dbConditions.permission_groups = {
    comparator: '&&', // Checks two array have any elements in common
    comparisonValue: userPermissions,
  };
  return dbConditions;
};
