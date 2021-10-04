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

  async findMeasuresByCode(code) {
    const overlays = await this.find(
      { code: [code] },
      {
        columns: [
          { code: `${TYPES.MAP_OVERLAY}.code` },
          { linked_measures: `${TYPES.MAP_OVERLAY}.linked_measures` },
        ],
      },
    );
    const measureCodes = overlays
      .map(({ code: overlayCode, linked_measures: linkedMeasures }) => [
        overlayCode,
        ...(linkedMeasures !== null ? linkedMeasures : []),
      ])
      .flat();

    const measureResults = await this.find({ code: measureCodes });
    return measureResults.sort(
      (a, b) =>
        measureCodes.findIndex(measureCode => measureCode === a.code) -
        measureCodes.findIndex(measureCode => measureCode === b.code),
    );
  }

  // Return measures joined with legacy info if it exists
  async findMeasuresWithLegacyInfo(criteria) {
    return this.database.find(this.databaseType, criteria, {
      columns: [
        'map_overlay.*',
        'legacy_report.data_builder',
        'legacy_report.data_builder_config',
        'legacy_report.data_services',
      ],
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
