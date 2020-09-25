/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { WORLD_MAP_OVERLAY_GROUP_CODE } from './MapOverlayGroup';

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

  async findTopLevelMapOverlayGroupRelations() {
    const worldMapOverlayGroup = await this.otherModels.mapOverlayGroup.findOne({
      code: WORLD_MAP_OVERLAY_GROUP_CODE,
    });

    return this.find({
      map_overlay_group_id: worldMapOverlayGroup.id,
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
}
