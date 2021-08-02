/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
  permissionsFilteredInternally = true;

  async findSingleRecord(mapOverlayId, options) {
    const mapOverlay = await super.findSingleRecord(mapOverlayId, options);

    const mapOverlayGroupChecker = accessPolicy =>
      assertMapOverlayGroupsGetPermissions(accessPolicy, this.models, mapOverlayId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupChecker]),
    );

    return mapOverlay;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createMapOverlayGroupDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    return { dbConditions, dbOptions: options };
  }
}
