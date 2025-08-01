import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class IndicatorRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.INDICATOR;
}

export class IndicatorModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  notifiers = [onChangeUpdateDataElement];

  get DatabaseRecordClass() {
    return IndicatorRecord;
  }
}

const onChangeUpdateDataElement = async (
  { type: changeType, new_record: newRecord, old_record: oldRecord },
  models,
) => {
  switch (changeType) {
    case 'update':
      if (oldRecord && oldRecord.code !== newRecord.code) {
        await models.dataElement.delete({
          code: oldRecord.code,
        });
      }
      return models.dataElement.findOrCreate(
        {
          code: newRecord.code,
          service_type: models.dataElement.SERVICE_TYPES.INDICATOR,
        },
        {},
      );
    case 'delete':
      return models.dataElement.delete({ code: oldRecord.code });
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
