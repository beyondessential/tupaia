/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class MapOverlayType extends DatabaseType {
  static databaseType = TYPES.MAP_OVERLAY;
}

export class MapOverlayModel extends DatabaseModel {
  notifiers = [onChangeDeleteRelation];

  get DatabaseTypeClass() {
    return MapOverlayType;
  }

  async findMeasuresByIds(ids) {
    const overlays = await this.find(
      { id: ids },
      {
        columns: [
          { id: `${TYPES.MAP_OVERLAY}.id` },
          { linkedMeasures: `${TYPES.MAP_OVERLAY}.linkedMeasures` },
        ],
      },
    );
    const measureIds = new Set();
    overlays.forEach(o => {
      const { id, linkedMeasures = [] } = o;
      measureIds.add(linkedMeasures);
      measureIds.add(id);
    });
    return this.find({ id: Array.from(measureIds) });
  }
}

const onChangeDeleteRelation = async ({ type: changeType, record_id: id }, models) => {
  switch (changeType) {
    case 'delete':
      return models.mapOverlayGroupRelation.delete({ child_id: id, child_type: 'mapOverlay' });
    default:
      return true;
  }
};
