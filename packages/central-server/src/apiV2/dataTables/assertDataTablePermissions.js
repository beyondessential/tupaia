import { NotFoundError } from '@tupaia/utils';
import { hasBESAdminAccess } from '../../permissions';
import { getPermissionListWithWildcard } from '../utilities';

export const hasDataTablePermissions = async (accessPolicy, models, dataTableId) => {
  const dataTable = await models.dataTable.findById(dataTableId);
  if (!dataTable) {
    throw new NotFoundError(`No data table exists with ID ${dataTableId}`);
  }
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);
  // Test if user has access to any or all permission groups against the data-table
  return (
    dataTable.permission_groups.length === 0 ||
    dataTable.permission_groups.some(code => userPermissions.includes(code))
  );
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
