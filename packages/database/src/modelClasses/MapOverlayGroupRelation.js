/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../TupaiaDatabase';

const MAP_OVERLAY = 'mapOverlay';
const MAP_OVERLAY_GROUP = 'mapOverlayGroup';
const RELATION_CHILD_TYPES = {
  MAP_OVERLAY,
  MAP_OVERLAY_GROUP,
};

export class MapOverlayGroupRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MAP_OVERLAY_GROUP_RELATION;

  async findChildRelations() {
    return this.model.find({ map_overlay_group_id: this.child_id });
  }
}

export class MapOverlayGroupRelationModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return MapOverlayGroupRelationRecord;
  }

  get RelationChildTypes() {
    return RELATION_CHILD_TYPES;
  }

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

  async find(criteria, dbOptions = {}) {
    const options = dbOptions;

    // Left join with map_overlay and map_overlay_group
    options.multiJoin = [
      {
        joinType: JOIN_TYPES.LEFT,
        joinWith: RECORDS.MAP_OVERLAY,
        joinCondition: [
          `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.child_id`,
          `${RECORDS.MAP_OVERLAY}.id`,
        ],
      },
      {
        joinType: JOIN_TYPES.LEFT,
        joinWith: RECORDS.MAP_OVERLAY_GROUP,
        joinCondition: [
          `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.child_id`,
          `${RECORDS.MAP_OVERLAY_GROUP}.id`,
        ],
      },
    ];

    // Add child code for both child type options
    options.columns = [];
    for (const { joinWith } of options.multiJoin) {
      const column = `${joinWith}.code as ${
        joinWith === RECORDS.MAP_OVERLAY ? 'mapOverlayChildCode' : 'mapOverlayGroupChildCode'
      }`;
      options.columns.push(column);
    }

    // Add original field names
    const fieldNames = await this.fetchFieldNames();
    for (const field of fieldNames) {
      const column = `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.${field} as ${field}`;
      options.columns.push(column);
    }

    const records = await this.database.find(this.databaseRecord, criteria, options);

    const recordsWithChildCode = records.map(record => {
      const { mapOverlayChildCode, mapOverlayGroupChildCode, ...rest } = record;

      // Coalesce these transient properties into ‘child_code’ (assuming EXACTLY one of them is null)
      rest.child_code = mapOverlayChildCode ?? mapOverlayGroupChildCode;

      // Keep only the desired properties
      return rest;
    });
    console.log('\x1b[1;34mrv\x1b[m', JSON.stringify(recordsWithChildCode, null, 2));

    return recordsWithChildCode;
  }

}
