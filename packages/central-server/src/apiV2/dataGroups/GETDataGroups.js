import { GETHandler } from '../GETHandler';
import {
  assertDataGroupGETPermissions,
  createDataGroupDBFilter,
} from './assertDataGroupPermissions';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

export class GETDataGroups extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(dataGroupId, options) {
    const dataGroupPermissionChecker = accessPolicy =>
      assertDataGroupGETPermissions(accessPolicy, this.models, dataGroupId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dataGroupPermissionChecker]),
    );

    return super.findSingleRecord(dataGroupId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDataGroupDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
