/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { JOIN_TYPES } from '../TupaiaDatabase';

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
          { linked_measures: `${TYPES.MAP_OVERLAY}.linked_measures` },
        ],
      },
    );
    const measureIds = overlays
      .map(({ id: overlayId, linked_measures: linkedMeasures }) => [
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

  // Return measures joined with legacy info if it exists
  async findMeasuresWithLegacyInfo(criteria) {
    return this.database.find(this.databaseType, criteria, {
      columns: ['map_overlay.*', 'legacy_report.*'],
      joinWith: TYPES.LEGACY_REPORT,
      joinCondition: [`${TYPES.MAP_OVERLAY}.report_code`, `${TYPES.LEGACY_REPORT}.code`],
      joinType: JOIN_TYPES.LEFT,
    });
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
