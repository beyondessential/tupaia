/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class MapOverlayGroupRelationType extends DatabaseType {
  static databaseType = TYPES.MAP_OVERLAY_GROUP_RELATION;
}

export class MapOverlayGroupRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MapOverlayGroupRelationType;
  }

  async findGroupRelations(mapOverlayGroupIds) {
    return this.find({
      map_overlay_group_id: {
        comparator: 'IN',
        comparisonValue: mapOverlayGroupIds,
      },
    });
  }

  async findChildRelations(childId) {
    return this.find({ map_overlay_group_id: childId });
  }
}
