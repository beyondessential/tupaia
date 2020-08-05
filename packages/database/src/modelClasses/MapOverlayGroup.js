/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { QUERY_CONJUNCTIONS, JOIN_TYPES } from '../TupaiaDatabase';
const { AND, RAW } = QUERY_CONJUNCTIONS;

class MapOverlayGroupType extends DatabaseType {
  static databaseType = TYPES.MAP_OVERLAY_GROUP;
}

export class MapOverlayGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MapOverlayGroupType;
  }

  async findTopLevelMapOverlayGroups() {
    return this.find(
      { child_id: null },
      {
        joinWith: TYPES.MAP_OVERLAY_GROUP_RELATION,
        joinType: JOIN_TYPES.LEFT_OUTER,
        joinCondition: [
          `${TYPES.MAP_OVERLAY_GROUP}.id`,
          `${TYPES.MAP_OVERLAY_GROUP_RELATION}.child_id`,
        ],
      },
    );
  }
}
