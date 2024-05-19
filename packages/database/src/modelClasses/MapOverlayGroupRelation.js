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

  /**
   * Overrides `DatabaseModel.find` to add `child_code` to the model. Note that this is a departure
   * from the underlying database schema.
   *
   * @see generateInstance
   */
  async find(criteria, customQueryOptions = {}) {
    const options = customQueryOptions;

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
        joinWith === RECORDS.MAP_OVERLAY ? 'childMapOverlayCode' : 'childMapOverlayGroupCode'
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

    const recordsWithChildCode = await Promise.all(
      records.map(record => this.generateInstance(record)),
    );

    console.log('\x1b[1;34mrecordsWithChildCode\x1b[m', recordsWithChildCode);

    return recordsWithChildCode;
  }

  /**
   * Coalesces the transient `childMapOverlayCode` and `childMapOverlayGroupCode` fields in the
   * records returned by {@link find} into a single `child_code` field.
   *
   * @see find
   */
  async generateInstance(fields = {}) {
    console.log('\x1b[1;34mMapOverlayGroupRelation\x1b[m', `\x1b[33mgenerateInstance()\x1b[m`);
    console.log('\x1b[1;34mfields\x1b[m', fields);

    const data = {};

    // Add values for standard fields
    const fieldNames = await this.fetchFieldNames();
    fieldNames.forEach(fieldName => {
      data[fieldName] = fields[fieldName];
    });

    // ↑↑↑ Same as overridden method ↑↑↑
    // ↓↓↓        Custom bits        ↓↓↓

    // Use child type to add definitive childCode (assumes EXACTLY one of these is null)
    data.child_code = fields.childMapOverlayCode ?? fields.childMapOverlayGroupCode;
    console.log('\x1b[1;34mchild_code\x1b[m', `\x1b[33m${data.child_code}\x1b[m`);

    return this.createRecordInstance(data);
  }
}
