import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import {
  assertEntityRelationPermissions,
  createEntityRelationDbFilter,
} from './assertEntityRelationPermissions';

export class GETEntityRelations extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(entityRelationId, options) {
    const entityRelationPermissionChecker = accessPolicy =>
      assertEntityRelationPermissions(accessPolicy, this.models, entityRelationId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityRelationPermissionChecker]),
    );

    return super.findSingleRecord(entityRelationId, options);
  }

  async getPermissionsFilter(criteria, options) {
    return createEntityRelationDbFilter(this.accessPolicy, criteria, options);
  }
}
