/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { SurveyModel as BaseSurveyModel, SurveyRecord } from '@tupaia/database';

export class SurveyModel extends BaseSurveyModel {
  notifiers = [onChangeUpdateDataGroup];

  get DatabaseRecordClass() {
    return SurveyRecord;
  }
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
