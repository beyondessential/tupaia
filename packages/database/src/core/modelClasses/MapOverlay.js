import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../BaseDatabase';

export class MapOverlayRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MAP_OVERLAY;
}

export class MapOverlayModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  notifiers = [onChangeDeleteRelation];

  get DatabaseRecordClass() {
    return MapOverlayRecord;
  }

  async findMeasuresByCode(code) {
    const overlays = await this.find(
      { code: [code] },
      {
        columns: [
          { code: `${RECORDS.MAP_OVERLAY}.code` },
          { linked_measures: `${RECORDS.MAP_OVERLAY}.linked_measures` },
        ],
      },
    );
    const measureCodes = overlays
      .flatMap(({ code: overlayCode, linked_measures: linkedMeasures }) => [
        overlayCode,
        ...(linkedMeasures !== null ? linkedMeasures : []),
      ]);

    const measureResults = await this.findMeasuresWithLegacyInfo({
      'map_overlay.code': measureCodes,
    });
    return measureResults.sort(
      (a, b) =>
        measureCodes.findIndex(measureCode => measureCode === a.code) -
        measureCodes.findIndex(measureCode => measureCode === b.code),
    );
  }

  // Return measures joined with legacy info if it exists
  async findMeasuresWithLegacyInfo(criteria) {
    return this.database.find(this.databaseRecord, criteria, {
      columns: [
        'map_overlay.*',
        'legacy_report.data_builder',
        'legacy_report.data_builder_config',
        'legacy_report.data_services',
      ],
      joinWith: RECORDS.LEGACY_REPORT,
      joinCondition: [`${RECORDS.MAP_OVERLAY}.report_code`, `${RECORDS.LEGACY_REPORT}.code`],
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
