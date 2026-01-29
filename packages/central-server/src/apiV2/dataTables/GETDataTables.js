import { PermissionsError } from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { createDataTableDBFilter, hasDataTablePermissions } from './assertDataTablePermissions';

const assertDataTableGETPermissions = async (accessPolicy, models, dataTableId) => {
  // User requires access to any permission group
  const authorized = await hasDataTablePermissions(accessPolicy, models, dataTableId);
  if (!authorized) {
    throw new PermissionsError('You don’t have permission to view this data table');
  }
  return true;
};

export class GETDataTables extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(dataTableId, options) {
    const dataTablePermissionChecker = accessPolicy =>
      assertDataTableGETPermissions(accessPolicy, this.models, dataTableId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dataTablePermissionChecker]),
    );

    return super.findSingleRecord(dataTableId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDataTableDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
