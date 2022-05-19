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

  async findSingleRecord(mapOverlayGroupId, options) {
    const mapOverlayGroup = await super.findSingleRecord(mapOverlayGroupId, options);

    const mapOverlayGroupChecker = accessPolicy =>
      assertMapOverlayGroupsGetPermissions(accessPolicy, this.models, mapOverlayGroupId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupChecker]),
    );

    return mapOverlayGroup;
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
