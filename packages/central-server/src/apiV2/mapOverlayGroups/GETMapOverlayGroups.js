import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlayGroupsGetPermissions,
  createMapOverlayGroupDBFilter,
} from './assertMapOverlayGroupsPermissions';

/**
 * Handles endpoints:
 * - /mapOverlayGroups
 * - /mapOverlayGroups/:mapOverlayGroupId
 */
export class GETMapOverlayGroups extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(mapOverlayGroupId, options) {
    const mapOverlayGroup = await super.findSingleRecord(mapOverlayGroupId, options);

    const mapOverlayGroupChecker = accessPolicy =>
      assertMapOverlayGroupsGetPermissions(accessPolicy, this.models, mapOverlayGroupId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupChecker]),
    );

    return mapOverlayGroup;
  }

  async getPermissionsFilter(criteria, dbOptions = {}) {
    const dbConditions = await createMapOverlayGroupDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );

    // Join with map_overlay_group_relation so that we can also fetch map overlay groups with no children so they can be displayed and edited
    return { dbConditions, dbOptions };
  }
}
