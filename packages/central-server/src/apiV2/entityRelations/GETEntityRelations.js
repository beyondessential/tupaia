import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import {
  assertEntityRelationPermissions,
  createEntityRelationDbFilter,
} from './assertEntityRelationPermissions';

export class GETEntityRelations extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(entityRelationId, options) {
    const entityRelationPermissionChecker = accessPolicy =>
      assertEntityRelationPermissions(accessPolicy, this.models, entityRelationId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityRelationPermissionChecker]),
    );

    const test = await super.findSingleRecord(entityRelationId, options);
    console.log('testtt', test);
    return test;
  }

  async getPermissionsFilter(criteria, options) {
    return createEntityRelationDbFilter(this.accessPolicy, criteria, options);
  }
}
