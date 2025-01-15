import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess, hasBESAdminAccess } from '../../permissions';
import { getPermissionListWithWildcard } from '../utilities';

export class GETExternalDatabaseConnections extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(externalDatabaseConnectionId, options) {
    await this.assertPermissions(assertBESAdminAccess);

    return super.findSingleRecord(externalDatabaseConnectionId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createExternalDatabaseConnectionDBFilter(
      this.accessPolicy,
      criteria,
    );
    return { dbConditions, dbOptions: options };
  }
}

const createExternalDatabaseConnectionDBFilter = async (accessPolicy, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);

  // Wildcard is added to our list so it will be included
  dbConditions.permission_groups = {
    comparator: '&&', // Checks two array have any elements in common
    comparisonValue: userPermissions,
  };
  return dbConditions;
};
