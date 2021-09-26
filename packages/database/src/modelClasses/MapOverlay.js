/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
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
    const measureIds = overlays
      .map(({ id: overlayId, linkedMeasures }) => [
        overlayId,
        ...(linkedMeasures !== null ? linkedMeasures : []),
      ])
      .flat();

    const measureResults = await this.find({ id: measureIds });
    return measureResults.sort(
      (a, b) =>
        measureIds.findIndex(measureId => measureId === a.id) -
        measureIds.findIndex(measureId => measureId === b.id),
    );
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
