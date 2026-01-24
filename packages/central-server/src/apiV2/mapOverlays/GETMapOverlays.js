import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlaysGetPermissions,
  createMapOverlayDBFilter,
} from './assertMapOverlaysPermissions';
/**
 * Handles endpoints:
 * - /mapOverlays
 * - /mapOverlays/:mapOverlayId
 */
export class GETMapOverlays extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(mapOverlayId, options) {
    const mapOverlay = await super.findSingleRecord(mapOverlayId, options);

    const mapOverlayChecker = accessPolicy =>
      assertMapOverlaysGetPermissions(accessPolicy, this.models, mapOverlayId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));

    return mapOverlay;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = createMapOverlayDBFilter(this.accessPolicy, criteria);
    return { dbConditions, dbOptions: options };
  }
}
