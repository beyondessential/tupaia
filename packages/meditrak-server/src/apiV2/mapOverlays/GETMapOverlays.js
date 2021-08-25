/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
  permissionsFilteredInternally = true;

  async findSingleRecord(mapOverlayId, options) {
    const mapOverlay = await super.findSingleRecord(mapOverlayId, options);

    const mapOverlayChecker = accessPolicy =>
      assertMapOverlaysGetPermissions(accessPolicy, this.models, mapOverlayId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));

    return mapOverlay;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createMapOverlayDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
