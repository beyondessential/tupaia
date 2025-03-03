import { hasBESAdminAccess } from '../../permissions';
import { getPermissionListWithWildcard } from '../utilities';

export const assertDataTableGETPermissions = async (accessPolicy, models, dataTableId) => {
  // User requires access to any permission group
  if (await assertDataTablePermissions(accessPolicy, models, dataTableId, 'some')) {
    return true;
  }
  throw new Error('You do not have permission to view this data-table');
};

const assertDataTablePermissions = async (accessPolicy, models, dataTableId, test) => {
  const dataTable = await models.dataTable.findById(dataTableId);
  if (!dataTable) {
    throw new Error(`No data-table exists with id ${dataTableId}`);
  }
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);
  // Test if user has access to any or all permission groups against the data-table
  if (
    dataTable.permission_groups.length <= 0 ||
    dataTable.permission_groups[test](code => userPermissions.includes(code))
  ) {
    return true;
  }
  return false;
};

export const createDataTableDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);

  // Permission groups on the data-table overlap with our permission groups
  // Wildcard is added to our list so it will be included
  dbConditions.permission_groups = {
    comparator: '&&', // Checks two array have any elements in common
    comparisonValue: userPermissions,
  };
  return dbConditions;
};
