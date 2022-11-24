/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { JOIN_TYPES } from '../TupaiaDatabase';

const MAP_OVERLAY = 'mapOverlay';
const MAP_OVERLAY_GROUP = 'mapOverlayGroup';
const RELATION_CHILD_TYPES = {
  MAP_OVERLAY,
  MAP_OVERLAY_GROUP,
};

class MapOverlayGroupRelationType extends DatabaseType {
  static databaseType = TYPES.MAP_OVERLAY_GROUP_RELATION;

  async findChildRelations() {
    return this.model.find({ map_overlay_group_id: this.child_id });
  }
}

export class MapOverlayGroupRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MapOverlayGroupRelationType;
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

  async find(dbConditions, customQueryOptions = {}) {
    const options = { ...customQueryOptions };
    // left joins with overlay and overlay group each time
    const multiJoin = [
      {
        joinWith: TYPES.MAP_OVERLAY,
        joinCondition: ['map_overlay.id', 'map_overlay_group_relation.child_id'],
        joinType: JOIN_TYPES.LEFT,
      },
      {
        joinWith: TYPES.MAP_OVERLAY_GROUP,
        joinCondition: ['map_overlay_group.id', 'map_overlay_group_relation.child_id'],
        joinType: JOIN_TYPES.LEFT,
      },
    ];
    options.multiJoin = multiJoin;
    options.columns = [];
    // Add childCode for both child type options
    multiJoin.forEach(join => {
      options.columns.push(
        `${join.joinWith}.code as ${
          join.joinWith === TYPES.MAP_OVERLAY ? 'mapOverlayChildCode' : 'mapOverlayGroupChildCode'
        }`,
      );
    });
    // Add original field names
    const fieldNames = await this.fetchFieldNames();
    fieldNames.forEach(field => {
      options.columns.push(`map_overlay_group_relation.${field} as ${field}`);
    });
    const dbResults = await this.database.find(this.databaseType, dbConditions, options);
    return Promise.all(dbResults.map(result => this.generateInstance(result)));
  }

  generateInstance = async (fields = {}) => {
    const data = {};
    // add values for standard fields
    const fieldNames = await this.fetchFieldNames();
    fieldNames.forEach(fieldName => {
      data[fieldName] = fields[fieldName];
    });
    // Use child type to add definitive childCode
    const getChildCodeKey = childType => {
      if (childType === 'mapOverlay') {
        return 'mapOverlayChildCode';
      }
      return 'mapOverlayGroupChildCode';
    };
    const childCodeKey = getChildCodeKey(fields.child_type);
    data.childCode = fields[childCodeKey];

    return this.createTypeInstance(data);
  };
}
