/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlaysPermissions,
  createMapOverlayDBFilter,
} from './assertMapOverlaysPermissions';
/**
 * Handles endpoints:
 * - /mapOverlay
 * - /mapOverlay/:mapOverlayId
 */
export class GETMapOverlays extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions); // all users can request, but results will be filtered according to access
  }

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

    if (!userAccounts.length) {
      throw new Error('Your permissions do not allow access to any of the requested resources');
    }

    return userAccounts;
  }
}
