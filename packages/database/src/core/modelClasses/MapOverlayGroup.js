import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../BaseDatabase';

const ROOT_MAP_OVERLAY_GROUP_CODE = 'Root';

export class MapOverlayGroupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MAP_OVERLAY_GROUP;
}

export class MapOverlayGroupModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  notifiers = [onChangeDeleteRelation];

  get DatabaseRecordClass() {
    return MapOverlayGroupRecord;
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
        joinWith: RECORDS.MAP_OVERLAY_GROUP_RELATION,
        joinType: JOIN_TYPES.INNER,
        joinCondition: [
          `${RECORDS.MAP_OVERLAY_GROUP}.id`,
          `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.child_id`,
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
