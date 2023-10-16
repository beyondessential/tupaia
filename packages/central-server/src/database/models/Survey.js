/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel, SurveyType as BaseSurveyType } from '@tupaia/database';

class SurveyType extends BaseSurveyType {
  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}

export class SurveyModel extends MaterializedViewLogDatabaseModel {
  notifiers = [onChangeUpdateDataGroup];

  get DatabaseTypeClass() {
    return SurveyType;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}

const onChangeUpdateDataGroup = async (
  { type: changeType, old_record: oldRecord, new_record: newRecord },
  models,
) => {
  switch (changeType) {
    case 'update': {
      const { code, data_group_id: dataGroupId } = newRecord;
      return models.dataGroup.updateById(dataGroupId, { code });
    }
    case 'delete': {
      const { data_group_id: dataGroupId } = oldRecord;
      return models.dataGroup.deleteById(dataGroupId);
    }
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
