import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
  hasBESAdminAccess,
} from '../../permissions';
import { GETHandler } from '../GETHandler';
import { mergeFilter } from '../utilities';
import { assertEntityHierarchyAdminPermissions } from './assertEntityHierarchyPermissions';

export class GETEntityHierarchy extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async assertUserHasAccess() {
    // If this is a single record request, check the user has access to the entity hierarchy
    if (this.recordId) {
      const projectPermissionsChecker = accessPolicy =>
        assertEntityHierarchyAdminPermissions(accessPolicy, this.models, this.recordId);

      await this.assertPermissions(
        assertAnyPermissions([assertBESAdminAccess, projectPermissionsChecker]),
      );
    }

    // Otherwise, check the user has access to the admin panel or is a BES admin
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, assertAdminPanelAccess]),
    );
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = { ...criteria };

    if (!hasBESAdminAccess(this.accessPolicy)) {
      const accessibleProjects = await this.models.project.getAccessibleProjects(this.accessPolicy);
      dbConditions.id = mergeFilter(
        accessibleProjects.map(project => project.entity_hierarchy_id),
        dbConditions.id,
      );
    }

    return { dbConditions, dbOptions: options };
  }
}
