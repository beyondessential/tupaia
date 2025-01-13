import { SurveyModel as BaseSurveyModel, SurveyRecord as BaseSurveyRecord } from '@tupaia/database';

class SurveyRecord extends BaseSurveyRecord {
  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}

export class SurveyModel extends BaseSurveyModel {
  notifiers = [onChangeUpdateDataGroup];

  get DatabaseRecordClass() {
    return SurveyRecord;
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
