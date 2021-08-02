/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlayGroupRelationsGetPermissions,
  createMapOverlayGroupRelationDBFilter,
  createRelationsViaParentOverlayGroupDBFilter,
} from './assertMapOverlayGroupRelationsPermissions';
import { assertMapOverlayGroupsGetPermissions } from '../mapOverlayGroups';

/**
 * Handles endpoints:
 * - /mapOverlayGroupRelations
 * - /mapOverlayGroupRelations/:mapOverlayGroupRelationId
 */
export class GETMapOverlayGroupRelations extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    map_overlay_group: ['map_overlay_group.id', 'map_overlay_group_relation.map_overlay_group_id'],
  };

  async findSingleRecord(mapOverlayId, options) {
    const mapOverlay = await super.findSingleRecord(mapOverlayId, options);

    const mapOverlayChecker = accessPolicy =>
      assertMapOverlayGroupRelationsGetPermissions(accessPolicy, this.models, mapOverlayId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));

    return mapOverlay;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createMapOverlayGroupRelationDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    // Check parent permissions
    const mapOverlayGroupPermissionChecker = accessPolicy =>
      assertMapOverlayGroupsGetPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupPermissionChecker]),
    );

    const dbConditions = await createRelationsViaParentOverlayGroupDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      this.parentRecordId,
    );

    return { dbConditions, dbOptions: options };
  }
}
