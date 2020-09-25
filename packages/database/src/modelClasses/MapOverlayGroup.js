/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { JOIN_TYPES } from '../TupaiaDatabase';

export const WORLD_MAP_OVERLAY_GROUP_CODE = 'World_Group';

class MapOverlayGroupType extends DatabaseType {
  static databaseType = TYPES.MAP_OVERLAY_GROUP;
}

export class MapOverlayGroupModel extends DatabaseModel {
  notifiers = [onChangeDeleteRelation];

  get DatabaseTypeClass() {
    return MapOverlayGroupType;
  }

  async findTopLevelMapOverlayGroups() {
    const worldMapOverlayGroup = await this.findOne({ code: WORLD_MAP_OVERLAY_GROUP_CODE });

    return this.find(
      { map_overlay_group_id: worldMapOverlayGroup.id, child_type: 'mapOverlayGroup' },
      {
        joinWith: TYPES.MAP_OVERLAY_GROUP_RELATION,
        joinType: JOIN_TYPES.INNER,
        joinCondition: [
          `${TYPES.MAP_OVERLAY_GROUP}.id`,
          `${TYPES.MAP_OVERLAY_GROUP_RELATION}.child_id`,
        ],
      },
    );
  }
}

const onChangeDeleteRelation = async ({ type: changeType, record }, models) => {
  const { id } = record; //map_overlay_group id

  switch (changeType) {
    case 'delete':
      await models.mapOverlayGroupRelation.delete({ child_id: id, child_type: 'mapOverlayGroup' });
      return models.mapOverlayGroupRelation.delete({ map_overlay_group_id: id });
    default:
      return true;
  }
};
