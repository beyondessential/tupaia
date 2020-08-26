/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlaysPermissions,
  filterMapOverlaysByPermissions,
} from './assertMapOverlaysPermissions';
/**
 * Handles endpoints:
 * - /mapOverlay
 * - /mapOverlay/:mapOverlayId
 */
export class GETMapOverlays extends GETHandler {
  async assertUserHasAccess() {
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(mapOverlayId, options) {
    const mapOverlay = await super.findSingleRecord(mapOverlayId, options);

    const mapOverlayChecker = accessPolicy =>
      assertMapOverlaysPermissions(accessPolicy, this.models, mapOverlay);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));

    return mapOverlay;
  }

  async findRecords(criteria, options) {
    const mapOverlays = await this.database.find(this.recordType, criteria, options);

    return filterMapOverlaysByPermissions(this.req.accessPolicy, this.models, mapOverlays);
  }
}
