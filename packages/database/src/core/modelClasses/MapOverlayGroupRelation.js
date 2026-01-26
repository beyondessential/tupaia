import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../BaseDatabase';

const MAP_OVERLAY = 'mapOverlay';
const MAP_OVERLAY_GROUP = 'mapOverlayGroup';
const RELATION_CHILD_TYPES = /** @type {const} */ ({
  MAP_OVERLAY,
  MAP_OVERLAY_GROUP,
});

export class MapOverlayGroupRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MAP_OVERLAY_GROUP_RELATION;

  static joins = /** @type {const} */ ([
    {
      joinType: JOIN_TYPES.LEFT,
      joinWith: RECORDS.MAP_OVERLAY,
      joinAs: 'child_map_overlay',
      joinCondition: [`${RECORDS.MAP_OVERLAY_GROUP_RELATION}.child_id`, `child_map_overlay.id`],
      fields: { code: 'code' },
    },
    {
      joinType: JOIN_TYPES.LEFT,
      joinWith: RECORDS.MAP_OVERLAY_GROUP,
      joinAs: 'child_map_overlay_group',
      joinCondition: [
        `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.child_id`,
        `child_map_overlay_group.id`,
      ],
      fields: { code: 'code' },
    },
  ]);

  async findChildRelations() {
    return this.model.find({ map_overlay_group_id: this.child_id });
  }
}

export class MapOverlayGroupRelationModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return MapOverlayGroupRelationRecord;
  }

  get RelationChildTypes() {
    return RELATION_CHILD_TYPES;
  }

  customColumnSelectors = {
    child_code: () => 'COALESCE(child_map_overlay.code, child_map_overlay_group.code)',
  };

  async findTopLevelMapOverlayGroupRelations() {
    const rootMapOverlayGroup = await this.otherModels.mapOverlayGroup.findRootMapOverlayGroup();

    return this.find({
      map_overlay_group_id: rootMapOverlayGroup.id,
      child_type: 'mapOverlayGroup',
    });
  }

  async findGroupRelations(mapOverlayGroupIds) {
    return this.find({
      map_overlay_group_id: {
        comparator: 'IN',
        comparisonValue: mapOverlayGroupIds,
      },
    });
  }

  async findParentRelationTree(childIds) {
    return this.database.findWithParents(
      this.databaseRecord,
      childIds,
      'child_id',
      'map_overlay_group_id',
    );
  }
}
