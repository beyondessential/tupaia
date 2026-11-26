import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class EntityPolygonRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_POLYGON;
}

export class EntityPolygonModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return EntityPolygonRecord;
  }

  customColumnSelectors = {
    polygon: fieldName => `ST_AsGeoJSON(${fieldName})`,
  };
}
