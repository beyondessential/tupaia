import { RECORDS } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlayGroupRelationsGetPermissions,
  createMapOverlayGroupRelationDBFilter,
  createRelationsViaParentMapOverlayDBFilter,
  createRelationsViaParentOverlayGroupDBFilter,
} from './assertMapOverlayGroupRelationsPermissions';
import { assertMapOverlayGroupsGetPermissions } from '../mapOverlayGroups';
import { assertMapOverlaysGetPermissions } from '../mapOverlays';

/**
 * Handles endpoints:
 * - /mapOverlayGroupRelations
 * - /mapOverlayGroupRelations/:mapOverlayGroupRelationId
 * - /mapOverlayGroups/:parentRecordId/mapOverlayGroupRelations
 * - /mapOverlays/:parentRecordId/mapOverlayGroupRelations
 */
export class GETMapOverlayGroupRelations extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  customJoinConditions = {
    map_overlay_group: {
      nearTableKey: 'map_overlay_group_relation.map_overlay_group_id',
      farTableKey: 'map_overlay_group.id',
    },
  };

  async findSingleRecord(mapOverlayGroupRelationId, options) {
    const mapOverlayGroupRelation = await super.findSingleRecord(
      mapOverlayGroupRelationId,
      options,
    );

    const mapOverlayChecker = accessPolicy =>
      assertMapOverlayGroupRelationsGetPermissions(
        accessPolicy,
        this.models,
        mapOverlayGroupRelationId,
      );

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));

    return mapOverlayGroupRelation;
  }

  async getDbQueryOptions() {
    const { multiJoin, sort, ...restOfOptions } = await super.getDbQueryOptions();
    return {
      ...restOfOptions,
      // Strip table prefix from `child_code` as it’s a `customColumn`
      sort: sort.map(s => s.replace('map_overlay_group_relation.child_code', 'child_code')),
      // Appending the multi-join from the Record class so that we can fetch the `child_code`
      multiJoin: multiJoin.concat(this.models.mapOverlayGroupRelation.DatabaseRecordClass.joins),
    };
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
    switch (this.parentRecordType) {
      case RECORDS.MAP_OVERLAY_GROUP:
        return this.getPermissionsViaParentMapOverlayGroupFilter(criteria, options);
      case RECORDS.MAP_OVERLAY:
        return this.getPermissionsViaParentMapOverlayFilter(criteria, options);
      default:
        throw new Error(`Cannot get map overlay relations for ${this.parentRecordType}`);
    }
  }

  async getPermissionsViaParentMapOverlayGroupFilter(criteria, options) {
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

  async getPermissionsViaParentMapOverlayFilter(criteria, options) {
    const parentPermissionChecker = accessPolicy =>
      assertMapOverlaysGetPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, parentPermissionChecker]),
    );

    const dbConditions = await createRelationsViaParentMapOverlayDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      this.parentRecordId,
    );

    return { dbConditions, dbOptions: options };
  }
}
