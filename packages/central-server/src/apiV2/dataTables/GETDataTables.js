import { GETHandler } from '../GETHandler';
import {
  assertDataTableGETPermissions,
  createDataTableDBFilter,
} from './assertDataTablePermissions';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

export class GETDataTables extends GETHandler {
  permissionsFilteredInternally = true;

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
