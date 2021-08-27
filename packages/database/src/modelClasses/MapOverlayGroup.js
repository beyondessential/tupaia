/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { JOIN_TYPES } from '../TupaiaDatabase';

const ROOT_MAP_OVERLAY_GROUP_CODE = 'Root';

class MapOverlayGroupType extends DatabaseType {
  static databaseType = TYPES.MAP_OVERLAY_GROUP;
}

export class MapOverlayGroupModel extends DatabaseModel {
  notifiers = [onChangeDeleteRelation];

  get DatabaseTypeClass() {
    return MapOverlayGroupType;
  }

  get RootMapOverlayGroupCode() {
    return ROOT_MAP_OVERLAY_GROUP_CODE;
  }

  async findRootMapOverlayGroup() {
    return this.findOne({ code: this.RootMapOverlayGroupCode });
  }

  async findTopLevelMapOverlayGroups() {
    const rootMapOverlayGroup = await this.findRootMapOverlayGroup();

    return this.find(
      { map_overlay_group_id: rootMapOverlayGroup.id, child_type: 'mapOverlayGroup' },
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

const onChangeDeleteRelation = async ({ type: changeType, record_id: id }, models) => {
  switch (changeType) {
    case 'delete':
      await models.mapOverlayGroupRelation.delete({ child_id: id, child_type: 'mapOverlayGroup' });
      return models.mapOverlayGroupRelation.delete({ map_overlay_group_id: id });
    default:
      return true;
  }
};
