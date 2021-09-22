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

  async findMeasuresById(id) {
    const overlays = await this.find(
      { id: [id] },
      {
        columns: [
          { id: `${TYPES.MAP_OVERLAY}.id` },
          { linkedMeasures: `${TYPES.MAP_OVERLAY}.linkedMeasures` },
        ],
      },
    );
    const measureIds = new Set();
    overlays.forEach(overlay => {
      const { id: overlayId, linkedMeasures } = overlay;
      if (linkedMeasures) {
        linkedMeasures.forEach(measureId => {
          measureIds.add(measureId);
        });
      }

      measureIds.add(overlayId);
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
