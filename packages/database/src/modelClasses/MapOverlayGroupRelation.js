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

  static joins = [
    {
      joinType: JOIN_TYPES.LEFT,
      joinWith: RECORDS.MAP_OVERLAY,
      joinCondition: [
        `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.child_id`,
        `${RECORDS.MAP_OVERLAY}.id`,
      ],
      fields: { code: 'childMapOverlayCode' },
    },
    {
      joinType: JOIN_TYPES.LEFT,
      joinWith: RECORDS.MAP_OVERLAY_GROUP,
      joinCondition: [
        `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.child_id`,
        `${RECORDS.MAP_OVERLAY_GROUP}.id`,
      ],
      fields: { code: 'childMapOverlayGroupCode' },
    },
  ];

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
    const options = await this.getQueryOptions(customQueryOptions);

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

    return recordsWithChildCode;
  }

  /**
   * Coalesces the transient `childMapOverlayCode` and `childMapOverlayGroupCode` fields in the
   * records returned by {@link find} into a single `child_code` field.
   *
   * @privateRemarks
   * Alternative solution would be to update ORM layer to leverage PostgreSQL’s COALESCE function,
   * which would obviate the need to override `find()` and `generateInstance()` here.
   *
   * @see find
   */
  async generateInstance(fields = {}) {
    const data = {};

    // Add values for standard fields
    const fieldNames = await this.fetchFieldNames();
    fieldNames.forEach(fieldName => {
      data[fieldName] = fields[fieldName];
    });

    // ↑↑↑ Same as overridden method ↑↑↑
    // ↓↓↓        Custom bits        ↓↓↓

    // Add child code field, discarding transient fields (assumes EXACTLY one of these is null)
    data.child_code = fields.childMapOverlayCode ?? fields.childMapOverlayGroupCode;

    return this.createRecordInstance(data);
  }
}
