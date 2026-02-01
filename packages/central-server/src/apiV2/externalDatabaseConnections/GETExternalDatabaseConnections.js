import { assertIsNotNullish } from '@tupaia/tsutils';
import { assertBESAdminAccess, hasBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { getPermissionListWithWildcard } from '../utilities';

export async function hasExternalDatabaseConnectionPermissions(
  accessPolicy,
  models,
  externalDatabaseConnectionId,
) {
  const [connection, userPermissions] = await Promise.all([
    models.externalDatabaseConnection.findById(externalDatabaseConnectionId),
    getPermissionListWithWildcard(accessPolicy),
  ]);
  assertIsNotNullish(
    connection,
    `No external database connection exists with ID ${externalDatabaseConnectionId}`,
  );

  return connection.permission_groups.some(code => userPermissions.includes(code));
}

export class GETExternalDatabaseConnections extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

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
