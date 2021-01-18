/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class IndicatorType extends DatabaseType {
  static databaseType = TYPES.INDICATOR;
}

export class IndicatorModel extends DatabaseModel {
  notifiers = [onChangeUpdateDataElement];

  get DatabaseTypeClass() {
    return IndicatorType;
  }
}

const onChangeUpdateDataElement = async (
  { type: changeType, new_record: newRecord, old_record: oldRecord },
  models,
) => {
  switch (changeType) {
    case 'update':
      if (oldRecord && oldRecord.code !== newRecord.code) {
        await models.dataSource.delete({
          code: oldRecord.code,
          type: models.dataSource.getTypes().DATA_ELEMENT,
        });
      }
      return models.dataSource.findOrCreate(
        {
          code: newRecord.code,
          type: models.dataSource.getTypes().DATA_ELEMENT,
          service_type: models.dataSource.SERVICE_TYPES.INDICATOR,
        },
        {},
      );
    case 'delete':
      return models.dataSource.delete({ code: oldRecord.code });
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
