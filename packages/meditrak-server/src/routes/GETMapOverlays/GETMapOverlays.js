/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlaysPermissions,
  createMapOverlayDBFilter,
} from './assertMapOverlaysPermissions';
/**
 * Handles endpoints:
 * - /mapOverlays
 * - /mapOverlays/:mapOverlayId
 */
export class GETMapOverlays extends GETHandler {
  async findSingleRecord(mapOverlayId, options) {
    const mapOverlay = await super.findSingleRecord(mapOverlayId, options);

    const mapOverlayChecker = accessPolicy =>
      assertMapOverlaysPermissions(accessPolicy, this.models, mapOverlayId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));

    return mapOverlay;
  }

  async findRecords(criteria, options) {
    const dbConditions = await createMapOverlayDBFilter(this.accessPolicy, this.models, criteria);
    const userAccounts = await super.findRecords(dbConditions, options);

    return userAccounts;
  }
}
